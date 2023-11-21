export interface HeaderInfo {
  title: string;
  link: string;
  level: number;
}

function isElement(el: Node): el is Element {
  return el.nodeType === Node.ELEMENT_NODE;
}

function isText(el: Node): el is Text {
  return el.nodeType === Node.TEXT_NODE;
}

function serializeHeader(h: Element): string {
  let ret = "";
  for (const node of h.childNodes) {
    if (isElement(node)) {
      if (
        node.classList.contains("VPBadge") ||
        node.classList.contains("header-anchor")
      ) {
        continue;
      }
      ret += node.textContent;
    } else if (isText(node)) {
      ret += node.textContent;
    }
  }
  return ret.trim();
}

// TODO: need refactor
export function getHeaders(): HeaderInfo[] {
  const headers = [...document.querySelectorAll(".VPDoc h2,h3,h4,h5,h6")]
    .filter((el) => el.id && el.hasChildNodes())
    .map((el) => {
      const level = Number(el.tagName[1]);
      return {
        title: serializeHeader(el),
        link: "#" + el.id,
        level,
      };
    });

  return headers;
}
