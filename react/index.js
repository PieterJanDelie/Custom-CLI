#!/usr/bin/env node

const createComponent = require("./component");
const createPage = require("./page");
const createLayout = require("./layout");
const createProject = require("./project");
const createService = require("./service");

const args = process.argv.slice(2);
const type = args[0];
const action = args[1];
const names = args.slice(2);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

if (action === "create" && names.length > 0) {
  const capitalizedNames = names.map(capitalizeFirstLetter);

  switch (type) {
    case "component":
    case "components":
      createComponent(capitalizedNames);
      break;
    case "page":
    case "pages":
      createPage(capitalizedNames);
      break;
    case "layout":
    case "layouts":
      createLayout(capitalizedNames);
      break;
    case "project":
    case "projects":
      if (capitalizedNames.length > 1) {
        console.error("Error: Only one project can be created at a time.");
      } else {
        createProject(capitalizedNames[0]);
      }
      break;
    case "service":
    case "services":
      createService(capitalizedNames);
      break;
    default:
      console.error(
        "Invalid type. Use component, page, layout, project, or service."
      );
  }
} else {
  console.log(
    "Usage: react <component|page|layout|project|service> create <name> [<name2> ...]"
  );
}
