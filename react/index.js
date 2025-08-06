#!/usr/bin/env node

const {
  createComponent,
  removeComponent,
  listComponents,
  renameComponent,
  componentInfo,
  createComponentTest,
  listUnusedComponents,
  showComponentHelp,
} = require("./component");
const createPage = require("./page");
const createLayout = require("./layout");
const createProject = require("./project");
const createService = require("./service");
const countLines = require("./lineCounter");

const args = process.argv.slice(2);
const type = args[0];
const action = args[1];
const names = args.slice(2);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

if (type === "component" || type === "components") {
  switch (action) {
    case "create":
      if (names.length > 0) {
        const capitalizedNames = names.map(capitalizeFirstLetter);
        createComponent(capitalizedNames);
      } else {
        console.error("Please provide at least one component name.");
      }
      break;
    case "remove":
      if (names.length > 0) {
        removeComponent(names);
      } else {
        console.error("Please provide at least one component name to remove.");
      }
      break;
    case "list":
      listComponents();
      break;
    case "rename":
      if (names.length === 2) {
        renameComponent(names[0], names[1]);
      } else {
        console.error("Usage: react component rename <oldName> <newName>");
      }
      break;
    case "info":
      componentInfo(names[0]);
      break;
    case "test":
      if (names.length > 0) {
        createComponentTest(names);
      } else {
        console.error(
          "Please provide at least one component name for test creation."
        );
      }
      break;
    case "unused":
      listUnusedComponents();
      break;
    case "help":
      showComponentHelp();
      break;
    default:
      console.log(
        "Usage: react component <create|remove|list|rename|info|test> ..."
      );
  }
} else if (action === "create" && names.length > 0) {
  const capitalizedNames = names.map(capitalizeFirstLetter);

  switch (type) {
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
        "Invalid type. Use component, page, layout, project, service, or lines."
      );
  }
} else if (type === "lines" && action === "count") {
  countLines();
} else {
  console.log(
    "Usage: react component <create|remove|list|rename|info|test> ...\n" +
      "       react <page|layout|project|service> create <name> [<name2> ...]\n" +
      "       react lines count"
  );
}
