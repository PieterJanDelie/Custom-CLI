const fs = require("fs");
const path = require("path");

const fs = require("fs");
const path = require("path");

function createPage(names) {
  const baseDir = "src/pages";
  names.forEach((name) => {
    const folderName = name;
    const jsxFileName = `${name}.jsx`;
    const cssFileName = `${name}.css`;
    const pagePath = path.join(process.cwd(), baseDir, folderName);

    if (!fs.existsSync(pagePath)) {
      fs.mkdirSync(pagePath, { recursive: true });
      console.log(`📄 Map '${pagePath}' is nu een echte pagina!`);
    } else {
      console.log(`🤔 Map '${pagePath}' bestaat al. Even chillen dus.`);
    }

    const jsxContent = `import React from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import "./${cssFileName}";

const ${name} = () => {
  return (
    <DefaultLayout>
      <div>
        <p>${name}</p>
      </div>
    </DefaultLayout>
  );
};

export default ${name};
`;

    fs.writeFileSync(path.join(pagePath, cssFileName), "");
    fs.writeFileSync(path.join(pagePath, jsxFileName), jsxContent);

    console.log(
      `✅ Bestanden '${cssFileName}' en '${jsxFileName}' zijn aangemaakt!`
    );

    // --- Voeg automatisch een Route toe aan App.jsx ---
    const appPath = path.join(process.cwd(), "src", "App.jsx");
    if (fs.existsSync(appPath)) {
      let appContent = fs.readFileSync(appPath, "utf8");

      // 1. Importeer de nieuwe pagina als dat nog niet bestaat
      const importStatement = `import ${name} from "./pages/${name}/${name}";`;
      if (!appContent.includes(importStatement)) {
        // Voeg import toe na de laatste import regel
        const importRegex = /import .+ from .+;\s*/g;
        const lastImportMatch = [...appContent.matchAll(importRegex)].pop();
        if (lastImportMatch) {
          const idx = lastImportMatch.index + lastImportMatch[0].length;
          appContent =
            appContent.slice(0, idx) +
            importStatement +
            "\n" +
            appContent.slice(idx);
        } else {
          appContent = importStatement + "\n" + appContent;
        }
      }

      // 2. Voeg Route toe vóór Not found of aan het einde van <Routes>
      const routeLine = `        <Route path="/${name.toLowerCase()}" element={<${name} />} />\n`;
      const routesRegex = /<Routes>([\s\S]*?)<\/Routes>/m;
      const notFoundRegex = /(<>\s*Not found\s*<\/>)/m;

      appContent = appContent.replace(routesRegex, (match, inner) => {
        // Voeg toe vóór Not found, anders voor de afsluitende </Routes>
        if (notFoundRegex.test(inner)) {
          return (
            "<Routes>" +
            inner.replace(notFoundRegex, routeLine + "        $1") +
            "</Routes>"
          );
        } else {
          // Voeg toe net voor </Routes>
          return (
            "<Routes>" + inner.replace(/(\s*)$/, routeLine + "$1") + "</Routes>"
          );
        }
      });

      fs.writeFileSync(appPath, appContent, "utf8");
      console.log(`🚦 Route voor '${name}' toegevoegd aan src/App.jsx!`);
    } else {
      console.warn(
        "⚠️  src/App.jsx niet gevonden, route niet automatisch toegevoegd."
      );
    }
  });
}

// Helper: Recursief alle pages vinden
function findAllPages(baseDir) {
  const pages = [];
  function find(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        find(fullPath);
      } else if (file.endsWith(".jsx")) {
        pages.push({
          name: path.basename(file, ".jsx"),
          path: fullPath,
        });
      }
    });
  }
  find(baseDir);
  return pages;
}

// LIST
function listPages() {
  const baseDir = path.join(process.cwd(), "src/pages");
  const pages = findAllPages(baseDir);
  console.log(
    `📚 Je hebt ${pages.length} page${pages.length === 1 ? "" : "s"} in totaal:`
  );
  pages.forEach((p) => console.log(`   - ${p.name} (${p.path})`));
}

// REMOVE
function removePage(names) {
  const baseDir = path.join(process.cwd(), "src/pages");
  names.forEach((name) => {
    const pagePath = path.join(baseDir, name);
    if (!fs.existsSync(pagePath)) {
      console.warn(`😅 Oeps! Page '${name}' bestaat niet.`);
      return;
    }
    // Zoek naar gebruik van deze page in het project
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
        `⚠️  Let op! Page '${name}' wordt nog vrolijk geïmporteerd in:`
      );
      usages.forEach((u) => console.warn(`   👉 ${u}`));
    }
    fs.rmSync(pagePath, { recursive: true, force: true });
    console.log(`🗑️  Page '${name}' is met zachte hand verwijderd!`);
  });
}

// RENAME
function renamePage(oldName, newName) {
  const baseDir = path.join(process.cwd(), "src/pages");
  const oldPath = path.join(baseDir, oldName);
  const newPath = path.join(baseDir, newName);

  if (!fs.existsSync(oldPath)) {
    console.error(`😬 Oei! Page '${oldName}' bestaat niet.`);
    return;
  }
  if (fs.existsSync(newPath)) {
    console.error(`😬 Page '${newName}' bestaat al. Kies een andere naam!`);
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
  console.log(`🎈 Page '${oldName}' heet nu officieel '${newName}'!`);
}

// INFO
function pageInfo(name) {
  const baseDir = path.join(process.cwd(), "src/pages");
  const pages = findAllPages(baseDir);

  // Helper: Tel het aantal imports van een page
  function countUsages(pageName) {
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
            `import\\s+.*${pageName}.*from\\s+['"].*${pageName}['"]`
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
    const page = pages.find((p) => p.name === name);
    if (!page) {
      console.log(`🙈 Page '${name}' niet gevonden.`);
      return;
    }
    const content = fs.readFileSync(page.path, "utf8");
    const lines = content.split("\n").length;
    const usages = countUsages(page.name);
    console.log(`🔎 Page: ${page.name}`);
    console.log(`   📄 Pad: ${page.path}`);
    console.log(`   📝 Regels code: ${lines}`);
    console.log(
      `   🔗 Gebruikt in: ${usages} andere file${usages === 1 ? "" : "s"}`
    );
  } else {
    pages.forEach((page) => {
      const content = fs.readFileSync(page.path, "utf8");
      const lines = content.split("\n").length;
      const usages = countUsages(page.name);
      console.log(
        `🔎 ${page.name} | 📝 ${lines} regels | 📄 ${
          page.path
        } | 🔗 Gebruikt in: ${usages} file${usages === 1 ? "" : "s"}`
      );
    });
  }
}

// UNUSED
function listUnusedPages() {
  const baseDir = path.join(process.cwd(), "src/pages");
  const pages = findAllPages(baseDir);

  // Helper: Tel het aantal imports van een page
  function countUsages(pageName) {
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
            `import\\s+.*${pageName}.*from\\s+['"].*${pageName}['"]`
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

  const unused = pages.filter((page) => countUsages(page.name) === 0);

  if (unused.length === 0) {
    console.log("🎉 Alle pages worden ergens gebruikt. Goed bezig!");
  } else {
    console.log("🕵️  Ongebruikte pages gevonden:");
    unused.forEach((page) => {
      console.log(`   - ${page.name} (${page.path})`);
    });
  }
}

// HELP
function showPageHelp() {
  console.log(`
✨ React Page CLI Help ✨

Hier vind je alle magische trucjes die je met 'react page' kunt uitvoeren:

  🛠️  create <naam> [<naam2> ...]
      Tovert één of meerdere pages tevoorschijn in src/pages.
      Voorbeeld: react page create Home About

  🗑️  remove <naam> [<naam2> ...]
      Laat pages verdwijnen (inclusief waarschuwing als ze nog ergens gebruikt worden).
      Voorbeeld: react page remove Home

  📚  list
      Zet alle pages netjes op een rijtje, ook die diep verstopt zitten.
      Voorbeeld: react page list

  🔄  rename <oudeNaam> <nieuweNaam>
      Geeft een page een frisse nieuwe naam én past alle imports aan.
      Voorbeeld: react page rename Home Main

  🔍  info [naam]
      Geeft je alle juicy details van één page, of van allemaal als je geen naam opgeeft.
      Voorbeeld: react page info Home
      Voorbeeld: react page info

  💤  unused
      Spoort luie, ongebruikte pages op die nergens worden geïmporteerd.
      Voorbeeld: react page unused
  `);
}

module.exports = {
  createPage,
  listPages,
  removePage,
  renamePage,
  pageInfo,
  listUnusedPages,
  showPageHelp,
};
