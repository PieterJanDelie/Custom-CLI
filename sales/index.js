#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const type = args[0]; // "lead", "prospect", "klant", "evangelist", "init", "search", "downgrade", "upgrade", "help"
const action = args[1]; // "create", "search", "downgrade", "upgrade", or undefined
const names = args.slice(2);

function createLeadFiles(names) {
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}/${today.getFullYear()}`;

  names.forEach((name) => {
    const nameLength = name.length;
    const dashes = "-".repeat(nameLength);
    const content = `----${dashes}
| ${name} |
----${dashes}

---------------------
| Persoonlijke info |
---------------------

--------------------
| Achtergrond info |
--------------------

------------
| ${formattedDate} |
------------`;

    const filePath = path.join(process.cwd(), `${name}.txt`);
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`File created: ${filePath}`);
  });
}

function initializeSalesFolders() {
  const folders = ["leads", "prospects", "klanten", "evangelisten", "declined"];
  folders.forEach((folder) => {
    const folderPath = path.join(process.cwd(), folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      console.log(`Folder created: ${folderPath}`);
    } else {
      console.log(`Folder already exists: ${folderPath}`);
    }
  });
}

function searchFiles(names) {
  const searchFolder = process.cwd();

  names.forEach((name) => {
    const fileName = `${name}.txt`;
    let found = false;

    function searchDirectory(directory) {
      const files = fs.readdirSync(directory);

      files.forEach((file) => {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          searchDirectory(fullPath);
        } else if (file === fileName) {
          const subFolder = path.relative(searchFolder, directory);
          console.log(`File "${fileName}" found in: ${subFolder || "."}`);
          found = true;
        }
      });
    }

    searchDirectory(searchFolder);

    if (!found) {
      console.log(`File "${fileName}" not found.`);
    }
  });
}

function downgradeFiles(names) {
  const downgradeMap = {
    evangelisten: "klanten",
    klanten: "prospects",
    prospects: "leads",
    leads: "declined",
  };

  const searchFolder = process.cwd();

  names.forEach((name) => {
    const fileName = `${name}.txt`;
    let found = false;

    for (const currentFolder of Object.keys(downgradeMap)) {
      const sourceFolder = path.join(searchFolder, currentFolder);
      const targetFolder = path.join(searchFolder, downgradeMap[currentFolder]);

      if (!fs.existsSync(sourceFolder)) continue;

      const sourcePath = path.join(sourceFolder, fileName);
      const destinationPath = path.join(targetFolder, fileName);

      if (fs.existsSync(sourcePath)) {
        if (!fs.existsSync(targetFolder)) {
          fs.mkdirSync(targetFolder);
          console.log(`Target folder created: ${targetFolder}`);
        }

        fs.renameSync(sourcePath, destinationPath);
        console.log(
          `File "${fileName}" downgraded from "${currentFolder}" to "${downgradeMap[currentFolder]}"`
        );
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`File "${fileName}" not found in any folder.`);
    }
  });
}

function upgradeFiles(names) {
  const upgradeMap = {
    declined: "leads",
    leads: "prospects",
    prospects: "klant",
    klanten: "evangelist",
  };

  const searchFolder = process.cwd();

  names.forEach((name) => {
    const fileName = `${name}.txt`;
    let found = false;

    for (const currentFolder of Object.keys(upgradeMap)) {
      const sourceFolder = path.join(searchFolder, currentFolder);
      const targetFolder = path.join(searchFolder, upgradeMap[currentFolder]);

      if (!fs.existsSync(sourceFolder)) continue;

      const sourcePath = path.join(sourceFolder, fileName);
      const destinationPath = path.join(targetFolder, fileName);

      if (fs.existsSync(sourcePath)) {
        if (!fs.existsSync(targetFolder)) {
          fs.mkdirSync(targetFolder);
          console.log(`Target folder created: ${targetFolder}`);
        }

        fs.renameSync(sourcePath, destinationPath);
        console.log(
          `File "${fileName}" upgraded from "${currentFolder}" to "${upgradeMap[currentFolder]}"`
        );
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`File "${fileName}" not found in any folder.`);
    }
  });
}

function showHelp() {
  console.log(`
Welkom bij de Sales CLI! Hier is een overzicht van de beschikbare commando's en hoe je ze kunt gebruiken:

1. **sales init**
   - Beschrijving: Maakt de standaard mappenstructuur aan voor je salesproces.
   - Mappen: "leads", "prospects", "klanten", "evangelisten", "declined".
   - Gebruik: 
     \`sales init\`

2. **sales <type> create <name> [<name2> ...]**
   - Beschrijving: Maakt een bestand aan voor een lead, prospect, klant of evangelist.
   - Types: "lead", "prospect", "klant", "evangelist".
   - Gebruik:
     \`sales lead create Karel Leonie\`

3. **sales search <name> [<name2> ...]**
   - Beschrijving: Zoekt naar bestanden in de huidige map en alle submappen.
   - Gebruik:
     \`sales search Karel Leonie\`

4. **sales downgrade <name> [<name2> ...]**
   - Beschrijving: Verplaatst een bestand naar een lagere categorie in het salesproces.
   - Hiërarchie: Evangelisten → Klanten → Prospects → Leads → Declined.

5. **sales upgrade <name> [<name2> ...]**
   - Beschrijving: Verplaatst een bestand naar een hogere categorie in het salesproces.
   - Hiërarchie: Declined → Leads → Prospects → Klanten → Evangelisten.

6. **sales help**
   - Beschrijving: Laat deze helptekst zien.
  `);
}

function showHel() {
  console.log(`
Oei oei oei. Ik hoop voor u dat het al bijna 17u is of bijna weekend. Computers zijn zeker irritant, en nog veel irritanter als gy niet meer kunt typen.

Pakt een koffieke, strekt u keer goed en en typt help keer juist. Allee succes nog hé!
  `);
}

if (type === "init") {
  initializeSalesFolders();
} else if (
  ["lead", "prospect", "klant", "evangelist"].includes(type) &&
  action === "create" &&
  names.length > 0
) {
  createLeadFiles(names);
} else if (type === "search" && names.length > 0) {
  searchFiles(names);
} else if (type === "downgrade" && names.length > 0) {
  downgradeFiles(names);
} else if (type === "upgrade" && names.length > 0) {
  upgradeFiles(names);
} else if (type === "help") {
  showHelp();
}  else if (type === "hel") {
  showHel();
} else {
  console.log(
    "Usage: sales <lead|prospect|klant|evangelist> create <name> [<name2> ...] | sales init | sales search <name> [<name2> ...] | sales downgrade <name> [<name2> ...] | sales upgrade <name> [<name2> ...] | sales help"
  );
}
