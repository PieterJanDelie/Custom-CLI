const fs = require("fs");
const path = require("path");

function countLines() {
  let totalLines = 0;
  let totalFiles = 0;
  const fileDetails = [];

  function traverseDirectory(dir) {
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
          traverseDirectory(fullPath);
        }
      } else if (stats.isFile()) {
        // Skip package files
        if (item === "package.json" || item === "package-lock.json") {
          return;
        }

        // Count lines for code files
        const ext = path.extname(item).toLowerCase();
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

        if (codeExtensions.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n").length;
            totalLines += lines;
            totalFiles++;

            const relativePath = path.relative(process.cwd(), fullPath);
            fileDetails.push({ file: relativePath, lines });
          } catch (error) {
            console.warn(`Could not read file: ${fullPath}`);
          }
        }
      }
    });
  }

  console.log("Counting lines of code...\n");
  traverseDirectory(process.cwd());

  // Sort files by line count (descending)
  fileDetails.sort((a, b) => b.lines - a.lines);

  // Display results
  console.log("=".repeat(60));
  console.log("📊 LINE COUNT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total files analyzed: ${totalFiles}`);
  console.log(`Total lines of code: ${totalLines.toLocaleString()}`);
  console.log("=".repeat(60));

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

module.exports = countLines;
