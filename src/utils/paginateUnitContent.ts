/** Reading-length targets are soft: never cut a paragraph, list, or example. */
export function paginateUnitContent(html: string, targetWords = 350): string[] {
  if (!html.trim()) return [];
  const document = new DOMParser().parseFromString(html, "text/html");
  const wordCount = (node: Node) =>
    node.textContent?.trim().split(/\s+/u).filter(Boolean).length ?? 0;

  function split(container: Element): string[] {
    // Only ordinary layout wrappers may be divided. Tables, lists, figures,
    // blockquotes, and other semantic blocks always travel as a whole.
    const blocks: Node[] = [];
    for (const node of container.childNodes) {
      if (
        node instanceof Element &&
        /^(DIV|SECTION|ARTICLE)$/.test(node.tagName) &&
        wordCount(node) > targetWords
      ) {
        for (const fragment of split(node)) {
          const wrapper = node.cloneNode(false) as Element;
          wrapper.innerHTML = fragment;
          blocks.push(wrapper);
        }
      } else {
        blocks.push(node);
      }
    }

    const pages: string[] = [];
    let page = document.createElement("div");
    let words = 0;
    let previous: Node | undefined;
    const flush = () => {
      if (page.textContent?.trim() || page.querySelector("img,video,iframe,table,hr")) pages.push(page.innerHTML);
      page = document.createElement("div");
      words = 0;
      previous = undefined;
    };
    for (const block of blocks) {
      const count = wordCount(block);
      const tag = block instanceof Element ? block.tagName : "";
      const previousTag = previous instanceof Element ? previous.tagName : "";
      // Headings stay with their following content. Lists/figures stay with
      // their introduction, even if this makes the page longer than usual.
      const attached = /^(H[1-6]|IMG|PICTURE)$/.test(previousTag) ||
        /^(UL|OL|FIGURE|IMG|PICTURE|TABLE)$/.test(tag);
      if (words >= targetWords && count > 0 && !attached) flush();
      else if (/^H[1-6]$/.test(tag) && words >= targetWords * 0.65 && !attached) flush();
      page.appendChild(block.cloneNode(true));
      words += count;
      if (count > 0 || (block instanceof Element && tag !== "BR")) previous = block;
    }
    flush();
    return pages;
  }
  // Ranges preserve ancestor formatting when a marker sits inside a wrapper.
  // Each explicit section is independently auto-paginated, so a manual break
  // never disables sensible automatic breaks in the rest of the unit.
  const markers = [...document.body.querySelectorAll('hr[data-slan-page-break="true"]')];
  if (!markers.length) return split(document.body);
  const pages: string[] = [];
  const range = document.createRange();
  range.setStart(document.body, 0);
  for (const marker of markers) {
    range.setEndBefore(marker);
    const section = document.createElement("div");
    section.append(range.cloneContents());
    pages.push(...split(section));
    range.setStartAfter(marker);
  }
  range.setEnd(document.body, document.body.childNodes.length);
  const section = document.createElement("div");
  section.append(range.cloneContents());
  pages.push(...split(section));
  return pages;
}
