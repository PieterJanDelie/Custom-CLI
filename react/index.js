#!/usr/bin/env node

const createComponent = require("./component");
const createPage = require("./page");
const createLayout = require("./layout");
const createProject = require("./project");
const createService = require("./service");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const type = args[0];
const action = args[1];
const names = args.slice(2);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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
          item !== "build"
        ) {
          traverseDirectory(fullPath);
        }
      } else if (stats.isFile()) {
        // Count lines for code files
        const ext = path.extname(item).toLowerCase();
        const codeExtensions = [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
          ".json",
          ".css",
          ".scss",
          ".html",
          ".md",
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

if (action === "create" && names.length > 0) {
  const capitalizedNames = names.map(capitalizeFirstLetter);

  switch (type) {
    case "component":
    case "components":
      createComponent(capitalizedNames);
      break;
    case "page":
    case "pages":
      createPage(capitalizedNames);
      break;
    case "layout":
    case "layouts":
      createLayout(capitalizedNames);
      break;
    case "project":
    case "projects":
      if (capitalizedNames.length > 1) {
        console.error("Error: Only one project can be created at a time.");
      } else {
        createProject(capitalizedNames[0]);
      }
      break;
    case "service":
    case "services":
      createService(capitalizedNames);
      break;
    default:
      console.error(
        "Invalid type. Use component, page, layout, project, service, or lines."
      );
  }
} else if (type === "lines" && action === "count") {
  countLines();
} else {
  console.log(
    "Usage: react <component|page|layout|project|service> create <name> [<name2> ...] | react lines count"
  );
}
