const fs = require("fs");
const path = require("path");

function createComponent(names) {
  const baseDir = "src/components";
  names.forEach((name) => {
    const folderName = name;
    const jsxFileName = `${name}.jsx`;
    const cssFileName = `${name}.css`;
    const componentPath = path.join(process.cwd(), baseDir, folderName);

    if (!fs.existsSync(componentPath)) {
      fs.mkdirSync(componentPath, { recursive: true });
      console.log(`Folder '${componentPath}' created.`);
    } else {
      console.log(`Folder '${componentPath}' already exists.`);
    }

    const jsxContent = `import React from "react";\nimport "./${cssFileName}";\n\nconst ${name} = () => {\n  return (\n    <p>${name}</p>\n  );\n};\n\nexport default ${name};\n`;

    fs.writeFileSync(path.join(componentPath, cssFileName), "");
    fs.writeFileSync(path.join(componentPath, jsxFileName), jsxContent);

    console.log(`Files '${cssFileName}' and '${jsxFileName}' created.`);
  });
}

module.exports = createComponent;
