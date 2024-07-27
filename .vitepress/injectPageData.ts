import { spawn } from "child_process";
import { join } from "path";
import type { PageData, TransformPageContext } from "vitepress";

function getGitPageVersions(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["log", "--pretty='%H %ai'", file]);
    let output = "";
    child.stdout.on("data", (data) => {
      output += data;
    });
    child.on("close", () => {
      resolve(output);
    });
    child.on("error", reject);
  });
}

export async function injectVersions(
  pageData: PageData,
  ctx: TransformPageContext,
) {
  const pagePath = join(ctx.siteConfig.root, pageData.filePath);
  const gitTimestamp = await getGitPageVersions(pagePath);
  const versions = gitTimestamp
    .trim()
    .split("\n")
    .map((line) => {
      line = line.slice(1, -1);
      const regex = /^(\S+)\s+(.*)$/;
      const match = line.match(regex);
      if (match) {
        const [_, hash, timestamp] = match;
        return {
          hash,
          timestamp,
        };
      }
    })
    .filter((item) => !!item);
  pageData.versions = versions;
}
