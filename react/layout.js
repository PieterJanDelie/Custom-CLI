const fs = require("fs");
const path = require("path");

// CREATE
function createLayout(names) {
  const baseDir = "src/layouts";
  names.forEach((name) => {
    const folderName = name;
    const jsxFileName = `${name}.jsx`;
    const layoutPath = path.join(process.cwd(), baseDir, folderName);

    if (!fs.existsSync(layoutPath)) {
      fs.mkdirSync(layoutPath, { recursive: true });
      console.log(`🎉 Map '${layoutPath}' is nu een feit!`);
    } else {
      console.log(`🤔 Map '${layoutPath}' bestaat al. Even chillen dus.`);
    }

    const jsxContent = `import React from "react";\n\nconst ${name} = ({ children }) => {\n  return (\n    <div>\n      {children}\n    </div>\n  );\n};\n\nexport default ${name};\n`;

    fs.writeFileSync(path.join(layoutPath, jsxFileName), jsxContent);

    console.log(`✅ Bestand '${jsxFileName}' is aangemaakt. Tijd voor koffie!`);
  });
}

// Helper: Recursief alle layouts vinden
function findAllLayouts(baseDir) {
  const layouts = [];
  function find(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        find(fullPath);
      } else if (file.endsWith(".jsx")) {
        layouts.push({
          name: path.basename(file, ".jsx"),
          path: fullPath,
        });
      }
    });
  }
  find(baseDir);
  return layouts;
}

// LIST
function listLayouts() {
  const baseDir = path.join(process.cwd(), "src/layouts");
  const layouts = findAllLayouts(baseDir);
  console.log(
    `📦 Je hebt ${layouts.length} layout${
      layouts.length === 1 ? "" : "s"
    } in totaal:`
  );
  layouts.forEach((l) => console.log(`   - ${l.name} (${l.path})`));
}

// REMOVE
function removeLayout(names) {
  const baseDir = path.join(process.cwd(), "src/layouts");
  names.forEach((name) => {
    const layoutPath = path.join(baseDir, name);
    if (!fs.existsSync(layoutPath)) {
      console.warn(`😅 Oeps! Layout '${name}' bestaat niet.`);
      return;
    }
    // Zoek naar gebruik van deze layout in het project
    const usages = [];
    function searchUsages(dir) {
      fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (!["node_modules", ".git", "dist", "build"].includes(file)) {
            searchUsages(fullPath);
          }
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
          const content = fs.readFileSync(fullPath, "utf8");
          const importRegex = new RegExp(
            `import\\s+.*${name}.*from\\s+['"].*${name}['"]`
          );
          if (importRegex.test(content)) {
            usages.push(fullPath);
          }
        }
      });
    }
    searchUsages(process.cwd());
    if (usages.length > 0) {
      console.warn(
        `⚠️  Let op! Layout '${name}' wordt nog vrolijk geïmporteerd in:`
      );
      usages.forEach((u) => console.warn(`   👉 ${u}`));
    }
    // Verwijder de map
    fs.rmSync(layoutPath, { recursive: true, force: true });
    console.log(`🗑️  Layout '${name}' is met zachte hand verwijderd!`);
  });
}

// RENAME
function renameLayout(oldName, newName) {
  const baseDir = path.join(process.cwd(), "src/layouts");
  const oldPath = path.join(baseDir, oldName);
  const newPath = path.join(baseDir, newName);

  if (!fs.existsSync(oldPath)) {
    console.error(`😬 Oei! Layout '${oldName}' bestaat niet.`);
    return;
  }
  if (fs.existsSync(newPath)) {
    console.error(`😬 Layout '${newName}' bestaat al. Kies een andere naam!`);
    return;
  }
  fs.renameSync(oldPath, newPath);

  // Hernoem bestanden in de map
  fs.readdirSync(newPath).forEach((file) => {
    if (file.startsWith(oldName)) {
      const ext = path.extname(file);
      fs.renameSync(
        path.join(newPath, file),
        path.join(newPath, newName + ext)
      );
    }
  });

  // Pas imports aan in het hele project
  function updateImports(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!["node_modules", ".git", "dist", "build"].includes(file)) {
          updateImports(fullPath);
        }
      } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        let content = fs.readFileSync(fullPath, "utf8");
        const importRegex = new RegExp(`(['"/])${oldName}(['"/])`, "g");
        if (importRegex.test(content)) {
          content = content.replace(importRegex, `$1${newName}$2`);
          fs.writeFileSync(fullPath, content, "utf8");
          console.log(`✏️  Import aangepast in: ${fullPath}`);
        }
      }
    });
  }
  updateImports(process.cwd());
  console.log(`🎈 Layout '${oldName}' heet nu officieel '${newName}'!`);
}

// INFO
function layoutInfo(name) {
  const baseDir = path.join(process.cwd(), "src/layouts");
  const layouts = findAllLayouts(baseDir);

  // Helper: Tel het aantal imports van een layout
  function countUsages(layoutName) {
    let count = 0;
    function search(dir) {
      fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (!["node_modules", ".git", "dist", "build"].includes(file)) {
            search(fullPath);
          }
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
          const content = fs.readFileSync(fullPath, "utf8");
          const importRegex = new RegExp(
            `import\\s+.*${layoutName}.*from\\s+['"].*${layoutName}['"]`
          );
          if (importRegex.test(content)) {
            count++;
          }
        }
      });
    }
    search(process.cwd());
    return count;
  }

  if (name) {
    const lay = layouts.find((l) => l.name === name);
    if (!lay) {
      console.log(`🙈 Layout '${name}' niet gevonden.`);
      return;
    }
    const content = fs.readFileSync(lay.path, "utf8");
    const lines = content.split("\n").length;
    const usages = countUsages(lay.name);
    console.log(`🔎 Layout: ${lay.name}`);
    console.log(`   📄 Pad: ${lay.path}`);
    console.log(`   📝 Regels code: ${lines}`);
    console.log(
      `   🔗 Gebruikt in: ${usages} andere file${usages === 1 ? "" : "s"}`
    );
  } else {
    layouts.forEach((lay) => {
      const content = fs.readFileSync(lay.path, "utf8");
      const lines = content.split("\n").length;
      const usages = countUsages(lay.name);
      console.log(
        `🔎 ${lay.name} | 📝 ${lines} regels | 📄 ${
          lay.path
        } | 🔗 Gebruikt in: ${usages} file${usages === 1 ? "" : "s"}`
      );
    });
  }
}

// UNUSED
function listUnusedLayouts() {
  const baseDir = path.join(process.cwd(), "src/layouts");
  const layouts = findAllLayouts(baseDir);

  // Helper: Tel het aantal imports van een layout
  function countUsages(layoutName) {
    let count = 0;
    function search(dir) {
      fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (!["node_modules", ".git", "dist", "build"].includes(file)) {
            search(fullPath);
          }
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
          const content = fs.readFileSync(fullPath, "utf8");
          const importRegex = new RegExp(
            `import\\s+.*${layoutName}.*from\\s+['"].*${layoutName}['"]`
          );
          if (importRegex.test(content)) {
            count++;
          }
        }
      });
    }
    search(process.cwd());
    return count;
  }

  const unused = layouts.filter((lay) => countUsages(lay.name) === 0);

  if (unused.length === 0) {
    console.log("🎉 Alle layouts worden ergens gebruikt. Goed bezig!");
  } else {
    console.log("🕵️  Ongebruikte layouts gevonden:");
    unused.forEach((lay) => {
      console.log(`   - ${lay.name} (${lay.path})`);
    });
  }
}

// HELP
function showLayoutHelp() {
  console.log(`
✨ React Layout CLI Help ✨

Hier vind je alle magische trucjes die je met 'react layout' kunt uitvoeren:

  🛠️  create <naam> [<naam2> ...]
      Tovert één of meerdere layouts tevoorschijn in src/layouts.
      Voorbeeld: react layout create MainLayout AuthLayout

  🗑️  remove <naam> [<naam2> ...]
      Laat layouts verdwijnen (inclusief waarschuwing als ze nog ergens gebruikt worden).
      Voorbeeld: react layout remove MainLayout

  📦  list
      Zet alle layouts netjes op een rijtje, ook die diep verstopt zitten.
      Voorbeeld: react layout list

  🔄  rename <oudeNaam> <nieuweNaam>
      Geeft een layout een frisse nieuwe naam én past alle imports aan.
      Voorbeeld: react layout rename MainLayout SuperLayout

  🔍  info [naam]
      Geeft je alle juicy details van één layout, of van allemaal als je geen naam opgeeft.
      Voorbeeld: react layout info MainLayout
      Voorbeeld: react layout info

  💤  unused
      Spoort luie, ongebruikte layouts op die nergens worden geïmporteerd.
      Voorbeeld: react layout unused
  `);
}

module.exports = {
  createLayout,
  listLayouts,
  removeLayout,
  renameLayout,
  layoutInfo,
  listUnusedLayouts,
  showLayoutHelp,
};
