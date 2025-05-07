#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const type = args[0]; // "lead"
const action = args[1]; // "create"
const names = args.slice(2); // ["Karel", "Leonie"]

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

if (type === "lead" && action === "create" && names.length > 0) {
  createLeadFiles(names);
} else if (type === "leads" && action === "create" && names.length > 0) {
  createLeadFiles(names);
}else {
  console.log("Usage: sales lead create <name> [<name2> ...]");
}