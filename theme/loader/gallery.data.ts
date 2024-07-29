import { readFileSync } from "fs";
import { basename, join } from "path";
import { defineLoader } from "vitepress";
import Parser, { SyntaxNode } from "tree-sitter";
import type { SiteConfig } from "vitepress";
import Markdown from "@tree-sitter-grammars/tree-sitter-markdown";

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;

export interface GalleryItem {
  head: string;
  link: string;
}

declare const data: Record<string, GalleryItem[]>;
export { data };

function walk(node: SyntaxNode, type: string, res: SyntaxNode[]) {
  if (node.type === type) {
    res.push(node);
  }
  for (const child of node.namedChildren) {
    walk(child, type, res);
  }
}

function parseMd(path: string): GalleryItem[] {
  const content = readFileSync(path).toString();
  const markdownParser = new Parser();
  const inlineParser = new Parser();
  markdownParser.setLanguage(Markdown);
  inlineParser.setLanguage(Markdown.inline);
  const markdownTree = markdownParser.parse(content);
  const inlineTree = inlineParser.parse(content);

  const sectionNodes: SyntaxNode[] = [];
  walk(markdownTree.rootNode, "section", sectionNodes);

  const pairs = sectionNodes
    .map((node) => {
      const start = node.startPosition;
      const end = node.endPosition;
      const headNodes = node.descendantsOfType("atx_heading", start, end);
      const linkNodes = inlineTree.rootNode.descendantsOfType(
        "link_destination",
        start,
        end,
      );
      return {
        head: headNodes[0],
        link: linkNodes[0],
      };
    })
    .filter((item) => item.head && item.link)
    .map(({ head, link }) => {
      return {
        head: head.text.trim().replace(/^#+\s*(.+)$/, (_match, p1) => p1),
        link: link.text.trim(),
      };
    });
  return pairs;
}

export default defineLoader({
  watch: ["gallery/**/*.md"],
  async load(watchedFiles) {
    watchedFiles = watchedFiles.map((relativePath) =>
      join(config.root, relativePath),
    );
    const res = watchedFiles.reduce(
      (pre, cur) => {
        const key: string = basename(cur, '.md');
        pre[key] = parseMd(cur);
        return pre;
      },
      Object.create(null)
    );

    return res;
  },
});
