import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import type { NodeKey } from "lexical";

export default function ReadingPageBreakLabel({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  return <span>Reading page break · <button type="button" aria-label="Remove page break"
    onClick={() => editor.update(() => { $getNodeByKey(nodeKey)?.remove(); })}>Remove</button></span>;
}
