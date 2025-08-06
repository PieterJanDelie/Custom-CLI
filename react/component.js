const fs = require("fs");
const path = require("path");

// Helper: Recursief alle componenten vinden
function findAllComponents(baseDir) {
  const components = [];
  function find(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        find(fullPath);
      } else if (file.endsWith(".jsx")) {
        components.push({
          name: path.basename(file, ".jsx"),
          path: fullPath,
        });
      }
    });
  }
  find(baseDir);
  return components;
}

// Helper: Tel het aantal imports van een component
function countUsages(componentName) {
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
          `import\\s+.*${componentName}.*from\\s+['"].*${componentName}['"]`
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

// CREATE
function createComponent(names) {
  const baseDir = "src/components";
  names.forEach((name) => {
    const folderName = name;
    const jsxFileName = `${name}.jsx`;
    const cssFileName = `${name}.css`;
    const componentPath = path.join(process.cwd(), baseDir, folderName);

    if (!fs.existsSync(componentPath)) {
      fs.mkdirSync(componentPath, { recursive: true });
      console.log(`🎉 Map '${componentPath}' is nu een feit!`);
    } else {
      console.log(`🤔 Map '${componentPath}' bestaat al. Even chillen dus.`);
    }

    const jsxContent = `import React from "react";\nimport "./${cssFileName}";\n\nconst ${name} = () => {\n  return (\n    <p>${name}</p>\n  );\n};\n\nexport default ${name};\n`;

    fs.writeFileSync(path.join(componentPath, cssFileName), "");
    fs.writeFileSync(path.join(componentPath, jsxFileName), jsxContent);

    console.log(
      `✅ Bestanden '${cssFileName}' en '${jsxFileName}' zijn aangemaakt. Tijd voor koffie!`
    );
  });
}

// REMOVE
function removeComponent(names) {
  const baseDir = path.join(process.cwd(), "src/components");
  names.forEach((name) => {
    const componentPath = path.join(baseDir, name);
    if (!fs.existsSync(componentPath)) {
      console.warn(`😅 Oeps! Component '${name}' bestaat niet.`);
      return;
    }
    // Zoek naar gebruik van deze component in het project
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
        `⚠️  Let op! Component '${name}' wordt nog vrolijk geïmporteerd in:`
      );
      usages.forEach((u) => console.warn(`   👉 ${u}`));
    }
    // Verwijder de map
    fs.rmSync(componentPath, { recursive: true, force: true });
    console.log(`🗑️  Component '${name}' is met zachte hand verwijderd!`);
  });
}

// LIST
function listComponents() {
  const baseDir = path.join(process.cwd(), "src/components");
  const components = findAllComponents(baseDir);
  console.log(
    `📦 Je hebt ${components.length} component${
      components.length === 1 ? "" : "en"
    } in totaal:`
  );
  components.forEach((c) => console.log(`   - ${c.name} (${c.path})`));
}

// RENAME
function renameComponent(oldName, newName) {
  const baseDir = path.join(process.cwd(), "src/components");
  const oldPath = path.join(baseDir, oldName);
  const newPath = path.join(baseDir, newName);

  if (!fs.existsSync(oldPath)) {
    console.error(`😬 Oei! Component '${oldName}' bestaat niet.`);
    return;
  }
  if (fs.existsSync(newPath)) {
    console.error(
      `😬 Component '${newName}' bestaat al. Kies een andere naam!`
    );
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
  console.log(`🎈 Component '${oldName}' heet nu officieel '${newName}'!`);
}

// INFO
function componentInfo(name) {
  const baseDir = path.join(process.cwd(), "src/components");
  const components = findAllComponents(baseDir);

  if (name) {
    const comp = components.find((c) => c.name === name);
    if (!comp) {
      console.log(`🙈 Component '${name}' niet gevonden.`);
      return;
    }
    const content = fs.readFileSync(comp.path, "utf8");
    const lines = content.split("\n").length;
    const usages = countUsages(comp.name);
    console.log(`🔎 Component: ${comp.name}`);
    console.log(`   📄 Pad: ${comp.path}`);
    console.log(`   📝 Regels code: ${lines}`);
    console.log(
      `   🔗 Gebruikt in: ${usages} andere file${usages === 1 ? "" : "s"}`
    );
  } else {
    components.forEach((comp) => {
      const content = fs.readFileSync(comp.path, "utf8");
      const lines = content.split("\n").length;
      const usages = countUsages(comp.name);
      console.log(
        `🔎 ${comp.name} | 📝 ${lines} regels | 📄 ${
          comp.path
        } | 🔗 Gebruikt in: ${usages} file${usages === 1 ? "" : "s"}`
      );
    });
  }
}

// UNUSED
function listUnusedComponents() {
  const baseDir = path.join(process.cwd(), "src/components");
  const components = findAllComponents(baseDir);

  const unused = components.filter((comp) => countUsages(comp.name) === 0);

  if (unused.length === 0) {
    console.log("🎉 Alle componenten worden ergens gebruikt. Goed bezig!");
  } else {
    console.log("🕵️  Ongebruikte componenten gevonden:");
    unused.forEach((comp) => {
      console.log(`   - ${comp.name} (${comp.path})`);
    });
  }
}

// TEST
function createComponentTest(names) {
  const baseDir = path.join(process.cwd(), "src/components");
  names.forEach((name) => {
    const testFileName = `${name}.test.js`;
    const componentPath = path.join(baseDir, name);
    const testFilePath = path.join(componentPath, testFileName);

    if (!fs.existsSync(componentPath)) {
      console.error(`😬 Component '${name}' bestaat niet. Testje overslaan!`);
      return;
    }
    if (fs.existsSync(testFilePath)) {
      console.warn(`⚠️  Testbestand bestaat al voor component '${name}'.`);
      return;
    }
    const testContent = `import React from "react";
import { render } from "@testing-library/react";
import ${name} from "./${name}";

test("renders ${name} component", () => {
  render(<${name} />);
});
`;
    fs.writeFileSync(testFilePath, testContent, "utf8");
    console.log(`🧪 Testbestand aangemaakt: ${testFilePath} (nu nog slagen!)`);
  });
}

function showComponentHelp() {
  console.log(`
✨ React Component CLI Help ✨

Hier vind je alle magische trucjes die je met 'react component' kunt uitvoeren:

  🛠️  create <naam> [<naam2> ...]
      Tovert één of meerdere componenten tevoorschijn in src/components.
      Voorbeeld: react component create Button Card

  🗑️  remove <naam> [<naam2> ...]
      Laat componenten verdwijnen (inclusief waarschuwing als ze nog ergens gebruikt worden).
      Voorbeeld: react component remove Button

  📦  list
      Zet alle componenten netjes op een rijtje, ook die diep verstopt zitten.
      Voorbeeld: react component list

  🔄  rename <oudeNaam> <nieuweNaam>
      Geeft een component een frisse nieuwe naam én past alle imports aan.
      Voorbeeld: react component rename Card SuperCard

  🔍  info [naam]
      Geeft je alle juicy details van één component, of van allemaal als je geen naam opgeeft.
      Voorbeeld: react component info Card
      Voorbeeld: react component info

  🧪  test <naam> [<naam2> ...]
      Maakt een testbestandje aan voor je component(en), zodat je altijd zeker bent van je zaak.
      Voorbeeld: react component test Card

  💤  unused
      Spoort luie, ongebruikte componenten op die nergens worden geïmporteerd.
      Voorbeeld: react component unused
  `);
}

module.exports = {
  createComponent,
  removeComponent,
  listComponents,
  renameComponent,
  componentInfo,
  createComponentTest,
  listUnusedComponents,
  showComponentHelp,
};
