export function resolveRelativePath(basePath: string, relativePath: string): string {
  const parts = basePath.split("/");
  const relParts = relativePath.split("/");

  // Remove the file name from the base path
  parts.pop();

  for (const part of relParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== ".") {
      parts.push(part);
    }
  }

  return parts.join("/");
}

export function getFt(fileName: string) {
  if (fileName.endsWith(".js")) return "javascript";
  if (fileName.endsWith(".css")) return "css";
  return "html";
}

export function getFilenameFromPath(path: string) {
  return path.split("/").pop()!;
}
