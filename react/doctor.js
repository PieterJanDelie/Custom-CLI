const fs = require("fs");
const path = require("path");

function runDoctor() {
  console.log("🩺 React Doctor - Projectscan gestart...\n");

  const issues = [];
  const suggestions = [];

  // Check 1: package.json bestaat
  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    issues.push("❌ Geen package.json gevonden");
    suggestions.push(
      "   💡 Voer 'npm init' uit om een package.json aan te maken"
    );
  } else {
    console.log("✅ package.json gevonden");

    // Check package.json dependencies
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      if (
        !packageJson.dependencies ||
        Object.keys(packageJson.dependencies).length === 0
      ) {
        suggestions.push(
          "   💡 Geen dependencies gevonden - voeg React toe met 'npm install react react-dom'"
        );
      }
      if (!packageJson.scripts || !packageJson.scripts.start) {
        suggestions.push(
          "   💡 Geen start script gevonden - voeg 'start' script toe aan package.json"
        );
      }
    } catch (error) {
      issues.push("❌ package.json bevat ongeldige JSON");
    }
  }

  // Check 2: src folder bestaat
  const srcPath = path.join(process.cwd(), "src");
  if (!fs.existsSync(srcPath)) {
    issues.push("❌ Geen src folder gevonden");
    suggestions.push("   💡 Maak een src folder aan voor je broncode");
  } else {
    console.log("✅ src folder gevonden");
  }

  // Check 3: Zoek naar dubbele componentnamen
  const duplicateComponents = findDuplicateComponents();
  if (duplicateComponents.length > 0) {
    issues.push(
      `❌ Dubbele componentnamen gevonden: ${duplicateComponents.join(", ")}`
    );
    suggestions.push("   💡 Hernoem componenten om conflicten te voorkomen");
  } else {
    console.log("✅ Geen dubbele componentnamen");
  }

  // Check 4: Zoek naar bestanden zonder export
  const filesWithoutExport = findFilesWithoutExport();
  if (filesWithoutExport.length > 0) {
    issues.push(
      `❌ ${filesWithoutExport.length} bestand(en) zonder export gevonden`
    );
    suggestions.push(
      "   💡 Voeg exports toe aan: " +
        filesWithoutExport.slice(0, 3).join(", ") +
        (filesWithoutExport.length > 3 ? "..." : "")
    );
  } else {
    console.log("✅ Alle bestanden hebben exports");
  }

  // Check 5: node_modules grootte
  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  if (fs.existsSync(nodeModulesPath)) {
    const size = getFolderSize(nodeModulesPath);
    if (size > 500) {
      // > 500MB
      suggestions.push(
        `   💡 node_modules is groot (${size}MB) - overweeg 'npm ci' voor een schone installatie`
      );
    }
  }

  // Resultaten tonen
  console.log("\n" + "=".repeat(60));
  console.log("📋 DOCTOR RAPPORT");
  console.log("=".repeat(60));

  if (issues.length === 0) {
    console.log("🎉 Geen problemen gevonden! Je project ziet er goed uit.");
  } else {
    console.log("🚨 PROBLEMEN GEVONDEN:");
    issues.forEach((issue) => console.log(issue));
  }

  if (suggestions.length > 0) {
    console.log("\n💡 SUGGESTIES:");
    suggestions.forEach((suggestion) => console.log(suggestion));
  }

  console.log("\n" + "=".repeat(60));
}

function findDuplicateComponents() {
  const components = new Map();
  const duplicates = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!["node_modules", ".git", "dist", "build"].includes(file)) {
          scanDirectory(fullPath);
        }
      } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
        const componentName = path.basename(file, path.extname(file));
        if (components.has(componentName)) {
          duplicates.push(componentName);
        } else {
          components.set(componentName, fullPath);
        }
      }
    });
  }

  scanDirectory(path.join(process.cwd(), "src"));
  return [...new Set(duplicates)];
}

function findFilesWithoutExport() {
  const filesWithoutExport = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!["node_modules", ".git", "dist", "build"].includes(file)) {
          scanDirectory(fullPath);
        }
      } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          if (
            !content.includes("export") &&
            !content.includes("module.exports")
          ) {
            filesWithoutExport.push(path.relative(process.cwd(), fullPath));
          }
        } catch (error) {
          // Ignore unreadable files
        }
      }
    });
  }

  scanDirectory(path.join(process.cwd(), "src"));
  return filesWithoutExport;
}

function getFolderSize(folderPath) {
  let totalSize = 0;

  function calculateSize(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          calculateSize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    } catch (error) {
      // Ignore permission errors
    }
  }

  calculateSize(folderPath);
  return Math.round(totalSize / (1024 * 1024)); // Convert to MB
}

module.exports = { runDoctor };
