import { getFilenameFromPath, resolveRelativePath } from "../share/path";

export interface SrcMeta {
  name: string;
  extname: string;
  content: string;
}

function parseHTMLDepsRelPath(htmlContent: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const cssFiles = Array.from(
    doc.querySelectorAll('link[rel="stylesheet"]'),
  ).map((link) => (link as HTMLLinkElement).getAttribute("href")!);

  const jsFiles = Array.from(doc.querySelectorAll("script[src]")).map(
    (script) => (script as HTMLScriptElement).getAttribute("src")!,
  );
  return [...cssFiles, ...jsFiles].filter(Boolean);
}

async function fetchFileContent(link: string) {
  const response = await fetch(link);
  return await response.text();
}

export function getFt(fileName: string) {
  if (fileName.endsWith(".js")) return "javascript";
  if (fileName.endsWith(".ts")) return "typescript";
  if (fileName.endsWith(".css")) return "css";
  if (fileName.endsWith("vue")) return "vue";
  return "html";
}

export async function getSrcMap(project: string, entryFile = "index.html") {
  const map: Record<string, string> = {};
  const entryFilePath = `/playground/${project}/${entryFile}`;
  const htmlContent = await fetchFileContent(entryFilePath);
  const deps = parseHTMLDepsRelPath(htmlContent);

  map[entryFile] = htmlContent;
  for (const relPath of deps) {
    const absolutePath = resolveRelativePath(entryFilePath, relPath);
    const fileName = getFilenameFromPath(absolutePath);
    const content = await fetchFileContent(absolutePath);
    map[fileName] = content;
  }

  return map;
}
