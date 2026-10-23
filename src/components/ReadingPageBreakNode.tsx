import type { ReactNode } from "react";
import ReadingPageBreakLabel from "./ReadingPageBreakLabel";
import { DecoratorNode } from "lexical";
import type { NodeKey, SerializedLexicalNode } from "lexical";

export class ReadingPageBreakNode extends DecoratorNode<ReactNode> {
  static getType() { return "reading-page-break"; }
  static clone(node: ReadingPageBreakNode) { return new ReadingPageBreakNode(node.__key); }
  constructor(key?: NodeKey) { super(key); }
  isInline() { return false; }
  createDOM() {
    const element = document.createElement("div");
    element.contentEditable = "false";
    element.style.cssText = "border-top:2px dashed #006400;border-bottom:1px dashed #006400;padding:10px;margin:16px 0;color:#006400;text-align:center;font-size:13px;";
    return element;
  }
  updateDOM() { return false; }
  decorate() { return <ReadingPageBreakLabel nodeKey={this.getKey()} />; }
  exportDOM() {
    const element = document.createElement("hr");
    element.setAttribute("data-slan-page-break", "true");
    return { element };
  }
  exportJSON(): SerializedLexicalNode { return { ...super.exportJSON(), type: "reading-page-break", version: 1 }; }
  static importJSON() { return new ReadingPageBreakNode(); }
  static importDOM() {
    return { hr: (element: HTMLElement) => element.getAttribute("data-slan-page-break") === "true"
      ? { conversion: () => ({ node: new ReadingPageBreakNode() }), priority: 4 as const } : null };
  }
}


