import { defaultPageStyle } from "./defaultPageStyle";

export interface PageStyle {
  width: number;
  height: number;
  backgroundColor: string;
  color: string;
  fontSize: string;
  padding: string;
}

export function truncate(text: string, pageStyle: PageStyle) {
  function handleTruncate(text: string, el: HTMLElement): string[] {
    const boxHeight = pageStyle.height ?? defaultPageStyle.height;
    const result = [];
    while (text.length > 0) {
      let low = 0;
      let high = text.length;
      while (low < high) {
        let mid = Math.floor((low + high + 1) / 2);
        el.innerText = text.substring(0, mid);
        if (el.scrollHeight > boxHeight) {
          high = mid - 1;
        } else {
          low = mid;
        }
      }
      result.push(text.substring(0, low));
      text = text.substring(low);
    }
    return result;
  }

  const div = document.createElement("div");
  pageStyle.width && (div.style.width = pageStyle.width + "px");
  pageStyle.height && (div.style.height = pageStyle.height + "px");
  Object.assign(div.style, pageStyle);
  document.body.appendChild(div);
  const res = handleTruncate(text, div);
  document.body.removeChild(div);
  return res;
}
