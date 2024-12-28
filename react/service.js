const fs = require("fs");
const path = require("path");

function createService(names) {
  const baseDir = "src/services";

  names.forEach((name) => {
    const serviceFileName = `${name}.js`;
    const serviceFilePath = path.join(process.cwd(), baseDir, serviceFileName);

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      console.log(`Folder '${baseDir}' created.`);
    }

    if (!fs.existsSync(serviceFilePath)) {
      const serviceContent = `/*${name}*/`;
      fs.writeFileSync(serviceFilePath, serviceContent);
      console.log(`File '${serviceFileName}' created in 'src/services'.`);
    } else {
      console.log(`File '${serviceFileName}' already exists.`);
    }
  });
}

module.exports = createService;
