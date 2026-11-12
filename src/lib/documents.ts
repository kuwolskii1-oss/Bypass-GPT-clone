/**
 * Turns an uploaded or dropped document into plain text for the editor.
 * Supports .txt, .md, .docx and .pdf. DOCX is read with the platform's
 * DecompressionStream (no dependency); pdf.js is loaded only when a PDF arrives.
 */

export const ACCEPTED_EXTENSIONS = [".txt", ".md", ".docx", ".pdf"] as const;
export const ACCEPT_ATTRIBUTE = [
  ...ACCEPTED_EXTENSIONS,
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

/** Larger files are almost always scans or image-heavy PDFs, not drafts. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type DocumentKind = "text" | "docx" | "pdf";

export class DocumentError extends Error {}

export interface ExtractedDocument {
  text: string;
  kind: DocumentKind;
  name: string;
}

export function documentKind(file: { name: string; type: string }): DocumentKind | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    return "docx";
  if (name.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) return "text";
  return null;
}

/** Collapses the whitespace document formats leave behind, keeping paragraph breaks. */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractDocumentText(file: File): Promise<ExtractedDocument> {
  const kind = documentKind(file);
  if (!kind) {
    throw new DocumentError(`${file.name} isn't a supported file. Use a .txt, .md, .docx or .pdf document.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new DocumentError(`${file.name} is larger than 10 MB. Paste the text you want checked instead.`);
  }
  let text: string;
  if (kind === "text") text = await file.text();
  else if (kind === "docx") text = await docxToText(new Uint8Array(await file.arrayBuffer()));
  else text = await pdfToText(new Uint8Array(await file.arrayBuffer()));
  text = cleanExtractedText(text);
  if (!text) {
    throw new DocumentError(
      kind === "pdf"
        ? `No text found in ${file.name}. It may be a scanned PDF; paste the text instead.`
        : `${file.name} is empty.`,
    );
  }
  return { text, kind, name: file.name };
}

// ---------------------------------------------------------------------------
// DOCX: a zip archive whose body lives in word/document.xml.
// ---------------------------------------------------------------------------

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Reads one entry from a zip archive using its central directory. */
export async function readZipEntry(zip: Uint8Array, entryName: string): Promise<Uint8Array | null> {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  // The end-of-central-directory record sits in the last 22 + 65535 bytes.
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const entries = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  for (let n = 0; n < entries; n++) {
    if (offset + 46 > zip.length || view.getUint32(offset, true) !== 0x02014b50) return null;
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(zip.subarray(offset + 46, offset + 46 + nameLength));
    if (name === entryName) {
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const body = zip.subarray(start, start + compressedSize);
      if (method === 0) return body;
      if (method === 8) return inflateRaw(body);
      return null;
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return null;
}

function decodeXmlEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e: string) => {
    const k = e.toLowerCase();
    if (k === "amp") return "&";
    if (k === "lt") return "<";
    if (k === "gt") return ">";
    if (k === "quot") return '"';
    if (k === "apos") return "'";
    const code = k.startsWith("#x") ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : m;
  });
}

/** Plain text of a WordprocessingML body: one line per paragraph, tabs and breaks kept. */
export function wordXmlToText(xml: string): string {
  const body = /<w:body[\s>][\s\S]*<\/w:body>/.exec(xml)?.[0] ?? xml;
  const paragraphs: string[] = [];
  const paraRe = /<w:p[\s>][\s\S]*?<\/w:p>|<w:p\/>/g;
  let p: RegExpExecArray | null;
  while ((p = paraRe.exec(body)) !== null) {
    let line = "";
    const tokenRe = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:(?:br|cr)(?:\s[^>]*)?\/>/g;
    let t: RegExpExecArray | null;
    while ((t = tokenRe.exec(p[0])) !== null) {
      if (t[1] !== undefined) line += decodeXmlEntities(t[1]);
      else if (t[0].startsWith("<w:tab")) line += "\t";
      else line += "\n";
    }
    // Word lists are numbered by style, not text; keep the item on its own line.
    if (/<w:numPr>/.test(p[0]) && line.trim()) line = `- ${line.trim()}`;
    paragraphs.push(line);
  }
  // Paragraphs become blank-line separated so the editor and engine see real paragraphs.
  return paragraphs
    .map((l) => l.trim())
    .reduce<string[]>((out, l, i, all) => {
      if (!l) return out;
      const prev = all[i - 1]?.trim() ?? "";
      const bothListItems = l.startsWith("- ") && prev.startsWith("- ");
      out.push(out.length === 0 ? l : `${bothListItems ? "\n" : "\n\n"}${l}`);
      return out;
    }, [])
    .join("");
}

export async function docxToText(data: Uint8Array): Promise<string> {
  const xml = await readZipEntry(data, "word/document.xml");
  if (!xml) throw new DocumentError("This .docx file couldn't be read. Save it again from Word or paste the text.");
  return wordXmlToText(new TextDecoder().decode(xml));
}

// ---------------------------------------------------------------------------
// PDF: pdf.js, loaded on demand in the browser.
// ---------------------------------------------------------------------------

interface PdfTextItem {
  str?: string;
  hasEOL?: boolean;
  transform?: number[];
}

async function pdfToText(data: Uint8Array): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }
  let doc;
  try {
    doc = await pdfjs.getDocument({ data }).promise;
  } catch (e) {
    const name = (e as { name?: string } | null)?.name;
    throw new DocumentError(
      name === "PasswordException"
        ? "This PDF is password-protected. Remove the password or paste the text."
        : "This PDF couldn't be read. Paste the text instead.",
    );
  }
  const pages: string[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    let out = "";
    let lastY: number | null = null;
    for (const item of content.items as PdfTextItem[]) {
      if (typeof item.str !== "string") continue;
      const y = item.transform?.[5] ?? null;
      // A large vertical jump between lines usually means a new paragraph.
      if (lastY !== null && y !== null && lastY - y > 18 && !out.endsWith("\n\n")) out = `${out.trimEnd()}\n\n`;
      out += item.str;
      if (item.hasEOL) out += " ";
      if (y !== null) lastY = y;
    }
    // Re-join words hyphenated across a line break ("exam- ple" -> "example").
    pages.push(out.replace(/(\p{L})-\s+(?=\p{Ll})/gu, "$1"));
  }
  await doc.destroy();
  return pages.join("\n\n");
}
