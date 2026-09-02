"use client";

import { ClipboardPaste, FileText, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { SAMPLES } from "@/lib/engine/samples";
import { cn, countWords, formatNumber } from "@/lib/utils";

export function Editor({
  value,
  onChange,
  minWords,
  maxWords,
  disabled,
  embedded,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  minWords: number;
  maxWords: number;
  disabled?: boolean;
  embedded?: boolean;
  className?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pasteHint, setPasteHint] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const words = countWords(value);
  const over = words > maxWords;
  const under = words > 0 && words < minWords;
  const empty = value.trim().length === 0;

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const paste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip.trim()) {
        onChange(clip);
        return;
      }
      setPasteHint("Clipboard is empty");
    } catch {
      setPasteHint("Press Ctrl+V / ⌘V to paste");
      textRef.current?.focus();
    }
    window.setTimeout(() => setPasteHint(null), 2200);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    onChange(text);
  };

  const counterTone = over ? "text-ai" : under ? "text-mixed" : "text-muted";
  const progress = Math.min(100, (words / maxWords) * 100);

  return (
    <div className={cn("relative flex min-w-0 flex-col", className)}>
      <textarea
        ref={textRef}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste or type your text here…"
        spellCheck={false}
        aria-label="Text to analyze"
        className={cn(
          "quiet-scroll w-full flex-1 bg-transparent px-5 py-4 text-[15px] leading-7 text-ink placeholder:text-faint focus:outline-none",
          embedded ? "min-h-[220px] sm:min-h-[260px]" : "min-h-[260px] sm:min-h-[300px]",
        )}
      />

      {empty && !disabled && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 px-4">
          <div className="pointer-events-auto flex flex-wrap justify-center gap-2" ref={menuRef}>
            <EmptyAction icon={<ClipboardPaste className="size-4" />} label="Paste text" onClick={paste} />
            <div className="relative">
              <EmptyAction
                icon={<FileText className="size-4" />}
                label="Try a sample"
                onClick={() => setMenuOpen((v) => !v)}
                expanded={menuOpen}
              />
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl border border-line bg-canvas p-1.5 text-left shadow-pop"
                >
                  {SAMPLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onChange(s.text);
                        setMenuOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left hover:bg-surface"
                    >
                      <span className="block text-sm font-medium text-ink">{s.label}</span>
                      <span className="block text-xs text-muted">{s.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <EmptyAction icon={<Upload className="size-4" />} label="Upload .txt" onClick={() => fileRef.current?.click()} />
          </div>
          {pasteHint && <p className="text-xs text-muted">{pasteHint}</p>}
        </div>
      )}
      <input ref={fileRef} type="file" accept=".txt,.md,text/plain" className="hidden" onChange={onFile} />

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-1 w-20 overflow-hidden rounded-full bg-surface-2" aria-hidden>
            <div
              className={cn("h-full rounded-full transition-[width] duration-300", over ? "bg-ai" : "bg-accent")}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={cn("text-xs tabular-nums", counterTone)}>
            {formatNumber(words)} / {formatNumber(maxWords)} words
            {under && <span className="ml-2 hidden sm:inline">· add {minWords - words} more for a reliable score</span>}
            {over && <span className="ml-2 hidden sm:inline">· over the free limit</span>}
          </span>
        </div>
        {!empty && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <X className="size-3.5" aria-hidden /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyAction({
  icon,
  label,
  onClick,
  expanded,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-canvas px-3.5 text-sm text-ink-2 shadow-card transition-all hover:-translate-y-px hover:border-line-strong hover:text-ink"
    >
      <span className="text-accent">{icon}</span>
      {label}
    </button>
  );
}
