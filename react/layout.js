const fs = require("fs");
const path = require("path");

function createLayout(names) {
  const baseDir = "src/layouts";
  names.forEach((name) => {
    const folderName = name;
    const jsxFileName = `${name}.jsx`;
    const layoutPath = path.join(process.cwd(), baseDir, folderName);

    if (!fs.existsSync(layoutPath)) {
      fs.mkdirSync(layoutPath, { recursive: true });
      console.log(`Folder '${layoutPath}' created.`);
    } else {
      console.log(`Folder '${layoutPath}' already exists.`);
    }

    const jsxContent = `import React from "react";\n\nconst ${name} = ({ children }) => {\n  return (\n    <div>\n      {children}\n    </div>\n  );\n};\n\nexport default ${name};\n`;

    fs.writeFileSync(path.join(layoutPath, jsxFileName), jsxContent);

    console.log(`File '${jsxFileName}' created.`);
  });
}

module.exports = createLayout;
