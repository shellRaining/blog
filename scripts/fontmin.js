import Fontmin from "fontmin";
import fs from "fs";
import path from "path";
import { glob } from "glob";

const srcPath = "scripts/LXGWWenKaiScreen.ttf";
const destPath = "public/font";
const projectRoot = process.cwd();

function getAllFiles(patterns) {
  return patterns.flatMap((pattern) =>
    glob.sync(pattern, { cwd: projectRoot, absolute: true }),
  );
}

function extractCharacters(files) {
  let characters = new Set();
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    for (let char of content) {
      characters.add(char);
    }
  });
  return Array.from(characters).join("");
}

const filePatterns = ["**/*.md", "**/*.toml"];
const mdAndTomlFiles = getAllFiles(filePatterns);
const text = extractCharacters(mdAndTomlFiles);

console.log(`Total unique characters: ${text.length}`);

const fontmin = new Fontmin()
  .src(srcPath)
  .use(Fontmin.glyph({ text }))
  .use(Fontmin.ttf2woff2())
  .dest(destPath);

fontmin.run(function(err, files) {
  if (err) {
    console.error(err);
  } else {
    console.log("Font subset created successfully");

    files.forEach((file) => {
      if (path.extname(file.path) !== ".woff2") {
        fs.unlinkSync(file.path);
      } else {
        console.log(`Output file: ${file.path}`);
      }
    });
  }
});
