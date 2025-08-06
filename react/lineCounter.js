const fs = require("fs");
const path = require("path");

function countLines(filter, extFilter) {
  let totalLines = 0;
  let totalFiles = 0;
  const fileDetails = [];
  const subfolderStats = {};

  // Welke subfolders wil je specifiek tonen?
  const trackedFolders = [
    "components",
    "contexts",
    "layouts",
    "pages",
    "services",
    "utils",
  ];

  // Toegestane extensies
  const codeExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".css",
    ".scss",
    ".html",
    ".md",
    ".vue",
    ".json",
  ];

  // Eventueel filter op extensie
  let allowedExtensions = codeExtensions;
  if (extFilter) {
    if (!extFilter.startsWith(".")) extFilter = "." + extFilter;
    allowedExtensions = [extFilter.toLowerCase()];
  }

  function traverseDirectory(dir, subfolderKey = null) {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Skip node_modules and other common ignore directories
        if (
          item !== "node_modules" &&
          item !== ".git" &&
          item !== "dist" &&
          item !== "build" &&
          item !== ".next" &&
          item !== "coverage"
        ) {
          // Bepaal of dit een van de trackedFolders is
          let nextKey = subfolderKey;
          if (
            !subfolderKey &&
            dir.endsWith("src") &&
            trackedFolders.includes(item)
          ) {
            nextKey = item;
          }
          traverseDirectory(fullPath, nextKey);
        }
      } else if (stats.isFile()) {
        // Skip package files
        if (item === "package.json" || item === "package-lock.json") {
          return;
        }

        // Count lines for code files
        const ext = path.extname(item).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          // Filter op subfolder als filter is opgegeven
          if (filter && subfolderKey !== filter) return;

          try {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n").length;
            totalLines += lines;
            totalFiles++;

            // Stats per subfolder
            if (subfolderKey) {
              if (!subfolderStats[subfolderKey]) {
                subfolderStats[subfolderKey] = { lines: 0, files: 0 };
              }
              subfolderStats[subfolderKey].lines += lines;
              subfolderStats[subfolderKey].files += 1;
            }

            const relativePath = path.relative(process.cwd(), fullPath);
            fileDetails.push({
              file: relativePath,
              lines,
              subfolder: subfolderKey,
            });
          } catch (error) {
            console.warn(`Could not read file: ${fullPath}`);
          }
        }
      }
    });
  }

  console.log("Counting lines of code...\n");
  const srcPath = path.join(process.cwd(), "src");
  if (fs.existsSync(srcPath)) {
    traverseDirectory(srcPath);
  } else {
    traverseDirectory(process.cwd());
  }

  // Sort files by line count (descending)
  fileDetails.sort((a, b) => b.lines - a.lines);

  // Display results
  console.log("=".repeat(60));
  console.log("📊 LINE COUNT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total files analyzed: ${totalFiles}`);
  console.log(`Total lines of code: ${totalLines.toLocaleString()}`);
  console.log("=".repeat(60));

  // Breakdown per subfolder + percentage
  if (!filter) {
    console.log("\n📁 Breakdown per subfolder in src:");
    trackedFolders.forEach((folder) => {
      const stats = subfolderStats[folder];
      if (stats) {
        const perc =
          totalLines > 0
            ? ((stats.lines / totalLines) * 100).toFixed(1)
            : "0.0";
        console.log(
          `- ${folder.padEnd(12)}: ${stats.lines
            .toString()
            .padStart(7)} lijnen in ${stats.files} files (${perc}%)`
        );
      }
    });
    console.log("-".repeat(60));
  }

  if (fileDetails.length > 0) {
    console.log("\n📁 TOP FILES BY LINE COUNT:");
    console.log("-".repeat(60));

    // Show top 10 files
    const topFiles = fileDetails.slice(0, 10);
    topFiles.forEach((file, index) => {
      console.log(
        `${(index + 1).toString().padStart(2)}. ${file.file.padEnd(
          40
        )} ${file.lines.toString().padStart(6)} lines`
      );
    });

    if (fileDetails.length > 10) {
      console.log(`... and ${fileDetails.length - 10} more files`);
    }
  }

  console.log("\n" + "=".repeat(60));
}

function showLinesHelp() {
  console.log(`
✨ React Lines CLI Help ✨

Met dit commando tel je supersnel het aantal regels code in je project!

Gebruik:
  react lines count
      ➔ Telt alle regels code in het hele project (behalve node_modules, build, ...).
      ➔ Geeft een breakdown per subfolder (components, pages, ...), inclusief percentage.

  react lines count <subfolder>
      ➔ Telt alleen de regels code in een specifieke subfolder van src.
      ➔ Voorbeeld: react lines count components

  react lines count <ext>
      ➔ Telt alleen bestanden met een bepaalde extensie.
      ➔ Voorbeeld: react lines count jsx

  react lines count <subfolder> <ext>
      ➔ Combineer subfolder en extensie!
      ➔ Voorbeeld: react lines count components js

  react lines count <ext> <subfolder>
      ➔ Je mag ook eerst de extensie geven!
      ➔ Voorbeeld: react lines count ts pages

Ondersteunde extensies: js, jsx, ts, tsx, css, scss, html, md, vue, json

Voorbeeld output:
  📦 Je hebt 1234 regels code in components (45% van totaal)
  📦 Je hebt 567 regels code in pages (20% van totaal)
  📁 TOP FILES BY LINE COUNT:
    1. src/components/BigFile.jsx      500 lines
    2. src/pages/Home.jsx              200 lines
    ...

Happy counting! 😃
  `);
}

module.exports = {
  countLines,
  showLinesHelp,
};
