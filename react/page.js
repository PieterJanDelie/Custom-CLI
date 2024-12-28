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
      console.log(`Folder '${pagePath}' created.`);
    } else {
      console.log(`Folder '${pagePath}' already exists.`);
    }

    // JSX-content volgens het voorbeeld
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

    // Leeg CSS-bestand aanmaken
    fs.writeFileSync(path.join(pagePath, cssFileName), "");
    // JSX-bestand aanmaken
    fs.writeFileSync(path.join(pagePath, jsxFileName), jsxContent);

    console.log(`Files '${cssFileName}' and '${jsxFileName}' created.`);
  });
}

module.exports = createPage;
