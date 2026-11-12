import { describe, expect, it } from "vitest";
import {
  DocumentError,
  cleanExtractedText,
  docxToText,
  documentKind,
  extractDocumentText,
  readZipEntry,
  wordXmlToText,
} from "../documents";

async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Minimal zip writer (deflate or stored) so tests can build real .docx files. */
async function makeZip(files: Record<string, string>, method: 0 | 8 = 8): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = enc.encode(name);
    const raw = enc.encode(content);
    const body = method === 8 ? await deflateRaw(raw) : raw;
    const local = new Uint8Array(30 + nameBytes.length + body.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(8, method, true);
    lv.setUint32(18, body.length, true);
    lv.setUint32(22, raw.length, true);
    lv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    local.set(body, 30 + nameBytes.length);
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(10, method, true);
    cv.setUint32(20, body.length, true);
    cv.setUint32(24, raw.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, centrals.length, true);
  ev.setUint16(10, centrals.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + centralSize + 22);
  let at = 0;
  for (const part of [...locals, ...centrals, eocd]) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

const DOC_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Remote work</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve">It saves time &amp; money, </w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>mostly.</w:t></w:r></w:p>
<w:p/>
<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>Fewer commutes</w:t></w:r></w:p>
<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>Quieter days</w:t></w:r></w:p>
<w:p><w:r><w:t>Name</w:t></w:r><w:r><w:tab/><w:t>Value</w:t></w:r><w:r><w:br/><w:t>caf&#233; &lt;3</w:t></w:r></w:p>
<w:sectPr/></w:body></w:document>`;

const EXPECTED = "Remote work\n\nIt saves time & money, mostly.\n\n- Fewer commutes\n- Quieter days\n\nName Value\ncafé <3";

describe("document upload", () => {
  it("recognises supported file types", () => {
    expect(documentKind({ name: "Essay.DOCX", type: "" })).toBe("docx");
    expect(documentKind({ name: "paper.pdf", type: "" })).toBe("pdf");
    expect(documentKind({ name: "notes.md", type: "" })).toBe("text");
    expect(documentKind({ name: "draft", type: "text/plain" })).toBe("text");
    expect(documentKind({ name: "photo.png", type: "image/png" })).toBeNull();
    expect(documentKind({ name: "old.doc", type: "application/msword" })).toBeNull();
  });

  it("extracts paragraphs, lists, tabs, breaks and entities from WordprocessingML", () => {
    expect(cleanExtractedText(wordXmlToText(DOC_XML))).toBe(EXPECTED);
  });

  it("reads deflated and stored zip entries", async () => {
    for (const method of [8, 0] as const) {
      const zip = await makeZip({ "[Content_Types].xml": "<Types/>", "word/document.xml": DOC_XML }, method);
      const entry = await readZipEntry(zip, "word/document.xml");
      expect(new TextDecoder().decode(entry!)).toBe(DOC_XML);
      expect(await readZipEntry(zip, "word/missing.xml")).toBeNull();
    }
  });

  it("turns a .docx file into editor text", async () => {
    const zip = await makeZip({ "word/document.xml": DOC_XML });
    expect(cleanExtractedText(await docxToText(zip))).toBe(EXPECTED);
    const file = new File([zip as BlobPart], "essay.docx");
    const doc = await extractDocumentText(file);
    expect(doc).toEqual({ text: EXPECTED, kind: "docx", name: "essay.docx" });
  });

  it("reads plain text and markdown and normalises whitespace", async () => {
    const doc = await extractDocumentText(new File(["  First line\r\n\r\n\r\n\r\nSecond\u00a0line  "], "a.txt"));
    expect(doc.text).toBe("First line\n\nSecond line");
  });

  it("explains unsupported, empty, corrupt and oversized files", async () => {
    await expect(extractDocumentText(new File(["x"], "pic.png", { type: "image/png" }))).rejects.toThrow(/\.docx or \.pdf/);
    await expect(extractDocumentText(new File(["   \n "], "empty.txt"))).rejects.toThrow(/is empty/);
    await expect(extractDocumentText(new File(["not a zip"], "broken.docx"))).rejects.toBeInstanceOf(DocumentError);
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.txt");
    await expect(extractDocumentText(big)).rejects.toThrow(/10 MB/);
  });
});
