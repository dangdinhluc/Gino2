import { useMemo, type ReactNode } from 'react';
import { List } from 'lucide-react';

/*
 * Markdown viewer tối giản, không thêm dependency.
 * Hỗ trợ đủ cho tài liệu học tập: heading (tạo mục lục), đoạn văn, in đậm,
 * in nghiêng, inline code, danh sách (ul/ol), blockquote, link, gạch ngang.
 * Không chạy HTML thô — mọi thứ render qua React element, an toàn với XSS.
 */

interface TocEntry {
  id: string;
  level: number;
  text: string;
}

/** Escape HTML để hiển thị text thuần an toàn (chỉ dùng cho text node). */
function inlineToNodes(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Thứ tự parse: code `x`, bold **x**, italic *x* (đơn giản, không lồng sâu).
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let counter = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`')) {
      nodes.push(<code key={`${keyPrefix}-c${counter++}`} className="rounded bg-[#f3efff] px-1.5 py-0.5 font-mono text-[0.85em] text-[#5f37c6]">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-b${counter++}`} className="font-bold text-[#252333]">{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={`${keyPrefix}-i${counter++}`} className="italic text-[#5f6b7c]">{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\p{L}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 48)
  );
}

export function MarkdownViewer({ source }: { source: string }) {
  const { toc, blocks } = useMemo(() => {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const tocEntries: TocEntry[] = [];
    const rendered: ReactNode[] = [];
    let listBuffer: { type: 'ul' | 'ol'; items: ReactNode[] } | null = null;
    let paragraphBuffer: string[] = [];
    let keyCounter = 0;

    const flushList = () => {
      if (!listBuffer) return;
      const ListTag = listBuffer.type === 'ol' ? 'ol' : 'ul';
      rendered.push(
        listBuffer.type === 'ol' ? (
          <ol key={`ol-${keyCounter++}`} className="mt-3 list-decimal space-y-1.5 pl-6 text-[#334155]">
            {listBuffer.items.map((item, i) => <li key={i}>{item}</li>)}
          </ol>
        ) : (
          <ul key={`ul-${keyCounter++}`} className="mt-3 list-disc space-y-1.5 pl-6 text-[#334155]">
            {listBuffer.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ),
      );
      listBuffer = null;
    };

    const flushParagraph = () => {
      if (paragraphBuffer.length === 0) return;
      const text = paragraphBuffer.join(' ');
      rendered.push(
        <p key={`p-${keyCounter++}`} className="mt-3 leading-7 text-[#334155]">
          {inlineToNodes(text, `p-${keyCounter}`)}
        </p>,
      );
      paragraphBuffer = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      // Heading
      const headingMatch = /^(#{1,4})\s+(.+)$/.exec(trimmed);
      if (headingMatch) {
        flushList();
        flushParagraph();
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const id = slugify(text) || `h-${keyCounter}`;
        tocEntries.push({ id, level, text });
        const sizeClass = level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base';
        const weight = level <= 2 ? 'font-black' : 'font-bold';
        rendered.push(
          <h3
            key={`h-${keyCounter++}`}
            id={id}
            className={`mt-5 ${sizeClass} ${weight} scroll-mt-24 tracking-[-0.01em] text-[#172033]`}
          >
            {inlineToNodes(text, `h-${keyCounter}`)}
          </h3>,
        );
        continue;
      }

      // Horizontal rule
      if (/^(\s*[-*_]\s*){3,}$/.test(trimmed)) {
        flushList();
        flushParagraph();
        rendered.push(<hr key={`hr-${keyCounter++}`} className="my-5 border-[#e8e3f2]" />);
        continue;
      }

      // Blockquote
      if (/^>\s?/.test(trimmed)) {
        flushList();
        flushParagraph();
        const content = trimmed.replace(/^>\s?/, '');
        rendered.push(
          <blockquote key={`bq-${keyCounter++}`} className="mt-3 border-l-4 border-[#b8a5e8] bg-[#f3efff] px-4 py-2 text-[#5f6b7c]">
            {inlineToNodes(content, `bq-${keyCounter}`)}
          </blockquote>,
        );
        continue;
      }

      // Unordered list item
      const ulMatch = /^[-*+]\s+(.+)$/.exec(trimmed);
      if (ulMatch) {
        flushParagraph();
        if (!listBuffer || listBuffer.type !== 'ul') {
          flushList();
          listBuffer = { type: 'ul', items: [] };
        }
        listBuffer.items.push(inlineToNodes(ulMatch[1], `li-${keyCounter++}`));
        continue;
      }

      // Ordered list item
      const olMatch = /^\d+[.)]\s+(.+)$/.exec(trimmed);
      if (olMatch) {
        flushParagraph();
        if (!listBuffer || listBuffer.type !== 'ol') {
          flushList();
          listBuffer = { type: 'ol', items: [] };
        }
        listBuffer.items.push(inlineToNodes(olMatch[1], `li-${keyCounter++}`));
        continue;
      }

      // Blank line → break block
      if (trimmed === '') {
        flushList();
        flushParagraph();
        continue;
      }

      // Regular paragraph text (accumulate across wrapped lines)
      paragraphBuffer.push(trimmed);
    }

    flushList();
    flushParagraph();

    return { toc: tocEntries, blocks: rendered };
  }, [source]);

  const hasToc = toc.length > 1;

  return (
    <div className="space-y-4">
      {hasToc && (
        <details className="group rounded-xl border border-[#e8e3f2] bg-[#f8f7fc] p-3" open>
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#5f6b7c]">
            <List size={15} className="text-[#6f45d8]" /> Mục lục
            <span className="ml-auto text-xs font-semibold text-[#95a0af]">{toc.length} mục</span>
          </summary>
          <nav className="mt-3 space-y-1" aria-label="Mục lục tài liệu">
            {toc.map((entry) => (
              <a
                key={entry.id}
                href={`#${entry.id}`}
                className="block truncate rounded-lg px-2 py-1 text-sm text-[#5f6b7c] transition-colors hover:bg-[#f3efff] hover:text-[#6f45d8]"
                style={{ paddingLeft: `${(entry.level - 1) * 12 + 8}px` }}
              >
                {entry.text}
              </a>
            ))}
          </nav>
        </details>
      )}
      <div>{blocks}</div>
    </div>
  );
}
