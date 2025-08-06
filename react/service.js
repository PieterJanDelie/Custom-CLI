const fs = require("fs");
const path = require("path");

function createService(names) {
  const baseDir = "src/services";
  names.forEach((name) => {
    const serviceFileName = `${name}.js`;
    const serviceFilePath = path.join(process.cwd(), baseDir, serviceFileName);

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      console.log(`📦 Map '${baseDir}' is aangemaakt!`);
    }

    if (!fs.existsSync(serviceFilePath)) {
      const serviceContent = `// ${name} service\n\nexport default function ${name}() {\n  // TODO: implement service logic\n}\n`;
      fs.writeFileSync(serviceFilePath, serviceContent);
      console.log(
        `✨ Service '${serviceFileName}' aangemaakt in 'src/services'.`
      );
    } else {
      console.log(`🤔 Service '${serviceFileName}' bestaat al.`);
    }
  });
}

// LIST
function listServices() {
  const baseDir = path.join(process.cwd(), "src/services");
  if (!fs.existsSync(baseDir)) {
    console.log("Geen services gevonden!");
    return;
  }
  const files = fs.readdirSync(baseDir).filter((f) => f.endsWith(".js"));
  console.log(
    `📚 Je hebt ${files.length} service${files.length === 1 ? "" : "s"}:`
  );
  files.forEach((f) => console.log(`  - ${f}`));
}

// REMOVE
function removeService(names) {
  const baseDir = path.join(process.cwd(), "src/services");
  names.forEach((name) => {
    const serviceFileName = `${name}.js`;
    const serviceFilePath = path.join(baseDir, serviceFileName);
    if (!fs.existsSync(serviceFilePath)) {
      console.warn(`😅 Service '${serviceFileName}' bestaat niet.`);
      return;
    }
    // Zoek naar gebruik van deze service
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
      console.warn(`⚠️  Service '${name}' wordt nog vrolijk geïmporteerd in:`);
      usages.forEach((u) => console.warn(`   👉 ${u}`));
    }
    fs.unlinkSync(serviceFilePath);
    console.log(`🗑️  Service '${serviceFileName}' is verwijderd!`);
  });
}

// RENAME
function renameService(oldName, newName) {
  const baseDir = path.join(process.cwd(), "src/services");
  const oldPath = path.join(baseDir, `${oldName}.js`);
  const newPath = path.join(baseDir, `${newName}.js`);

  if (!fs.existsSync(oldPath)) {
    console.error(`😬 Service '${oldName}.js' bestaat niet.`);
    return;
  }
  if (fs.existsSync(newPath)) {
    console.error(`😬 Service '${newName}.js' bestaat al.`);
    return;
  }
  fs.renameSync(oldPath, newPath);

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
  console.log(`🎈 Service '${oldName}' heet nu officieel '${newName}'!`);
}

// INFO
function serviceInfo(name) {
  const baseDir = path.join(process.cwd(), "src/services");
  if (!fs.existsSync(baseDir)) {
    console.log("Geen services gevonden!");
    return;
  }
  const files = fs.readdirSync(baseDir).filter((f) => f.endsWith(".js"));
  if (name) {
    const file = files.find((f) => f === `${name}.js`);
    if (!file) {
      console.log(`🙈 Service '${name}' niet gevonden.`);
      return;
    }
    const filePath = path.join(baseDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").length;
    const usages = countUsages(name);
    console.log(`🔎 Service: ${name}`);
    console.log(`   📄 Pad: ${filePath}`);
    console.log(`   📝 Regels code: ${lines}`);
    console.log(
      `   🔗 Gebruikt in: ${usages} andere file${usages === 1 ? "" : "s"}`
    );
  } else {
    files.forEach((file) => {
      const name = file.replace(/\.js$/, "");
      const filePath = path.join(baseDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n").length;
      const usages = countUsages(name);
      console.log(
        `🔎 ${name} | 📝 ${lines} regels | 📄 ${filePath} | 🔗 Gebruikt in: ${usages} file${
          usages === 1 ? "" : "s"
        }`
      );
    });
  }
}

// UNUSED
function listUnusedServices() {
  const baseDir = path.join(process.cwd(), "src/services");
  if (!fs.existsSync(baseDir)) {
    console.log("Geen services gevonden!");
    return;
  }
  const files = fs.readdirSync(baseDir).filter((f) => f.endsWith(".js"));
  function countUsages(serviceName) {
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
            `import\\s+.*${serviceName}.*from\\s+['"].*${serviceName}['"]`
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
  const unused = files.filter(
    (file) => countUsages(file.replace(/\.js$/, "")) === 0
  );
  if (unused.length === 0) {
    console.log("🎉 Alle services worden ergens gebruikt. Goed bezig!");
  } else {
    console.log("🕵️  Ongebruikte services gevonden:");
    unused.forEach((file) => {
      console.log(`   - ${file}`);
    });
  }
}

// HELP
function showServiceHelp() {
  console.log(`
✨ React Service CLI Help ✨

Hier vind je alle magische trucjes die je met 'react service' kunt uitvoeren:

  🛠️  create <naam> [<naam2> ...]
      Tovert één of meerdere services tevoorschijn in src/services.
      Voorbeeld: react service create ApiService AuthService

  🗑️  remove <naam> [<naam2> ...]
      Laat services verdwijnen (inclusief waarschuwing als ze nog ergens gebruikt worden).
      Voorbeeld: react service remove ApiService

  📚  list
      Zet alle services netjes op een rijtje.
      Voorbeeld: react service list

  🔄  rename <oudeNaam> <nieuweNaam>
      Geeft een service een frisse nieuwe naam én past alle imports aan.
      Voorbeeld: react service rename ApiService SuperService

  🔍  info [naam]
      Geeft je alle juicy details van één service, of van allemaal als je geen naam opgeeft.
      Voorbeeld: react service info ApiService
      Voorbeeld: react service info

  💤  unused
      Spoort luie, ongebruikte services op die nergens worden geïmporteerd.
      Voorbeeld: react service unused
  `);
}

// Helper: Tel het aantal imports van een service
function countUsages(serviceName) {
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
          `import\\s+.*${serviceName}.*from\\s+['"].*${serviceName}['"]`
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

module.exports = {
  createService,
  listServices,
  removeService,
  renameService,
  serviceInfo,
  listUnusedServices,
  showServiceHelp,
};
