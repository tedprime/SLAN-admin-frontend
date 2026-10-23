import { useState } from "react";
import { ReadingPageBreakNode } from "./ReadingPageBreakNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $createParagraphNode, $getRoot, $getSelection, $isRangeSelection } from "lexical";

import { paginateUnitContent } from "../utils/paginateUnitContent";

export default function ReadingPartsControls({ prepareHtml }: { prepareHtml: (html: string) => string }) {
  const [editor] = useLexicalComposerContext();
  const [pages, setPages] = useState<string[] | null>(null);
  const [page, setPage] = useState(0);
  const insertBreak = () => editor.update(() => {
    const selection = $getSelection();
    const root = $getRoot();
    // Insert after the entire selected block, preserving paragraphs, lists,
    // and tables rather than cutting through a sentence or table cell.
    const block = $isRangeSelection(selection)
      ? selection.anchor.getNode().getTopLevelElement() : null;
    const marker = new ReadingPageBreakNode();
    if (block) block.insertAfter(marker);
    else root.append(marker);
    const next = marker.getNextSibling();
    if (next) next.selectStart();
    else {
      const paragraph = $createParagraphNode();
      marker.insertAfter(paragraph);
      paragraph.selectStart();
    }
  });
  const preview = () => editor.getEditorState().read(() => {
    setPages(paginateUnitContent(prepareHtml($generateHtmlFromNodes(editor, null))));
    setPage(0);
  });
  const button = "px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40";
  return (
    <div className="my-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onMouseDown={event => event.preventDefault()} onClick={insertBreak}>Insert page break</button>
        <button type="button" className={button} onClick={preview}>Preview reading parts</button>
      </div>
      <p className="text-xs text-gray-500">Page breaks go after the paragraph, list, or table containing your cursor. Use Remove on a break to delete it. Long sections also split automatically.</p>
      {pages !== null && (
        <section aria-label="Reading parts preview" className="border rounded-xl p-4 bg-white space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p role="status" className="text-sm font-semibold">{pages.length ? `Part ${page + 1} of ${pages.length}` : "No reading content yet"}</p>
            <button type="button" className={button} onClick={() => setPages(null)}>Close preview</button>
          </div>
          <p className="text-xs text-gray-500">Preview of current edits. Open preview again after editing to refresh.</p>
          <div className="max-h-[50vh] overflow-auto">
            <div style={{ maxWidth: 800, fontSize: 15, lineHeight: 1.7, color: "#444444" }} dangerouslySetInnerHTML={{ __html: pages[page] ?? "" }} />
          </div>
          <nav aria-label="Preview parts" className="flex justify-between gap-2">
            <button type="button" className={button} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous part</button>
            <button type="button" className={button} disabled={page >= pages.length - 1} onClick={() => setPage(page + 1)}>Continue</button>
          </nav>
        </section>
      )}
    </div>
  );
}

