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
const {
  createLayout,
  listLayouts,
  removeLayout,
  renameLayout,
  layoutInfo,
  listUnusedLayouts,
  showLayoutHelp,
} = require("./layout");
const createPage = require("./page");
const createProject = require("./project");
const createService = require("./service");
const { countLines, showLinesHelp } = require("./lineCounter");

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
        "Usage: react component <create|remove|list|rename|info|test|unused|help> ..."
      );
  }
} else if (type === "layout" || type === "layouts") {
  switch (action) {
    case "create":
      if (names.length > 0) {
        createLayout(names);
      } else {
        console.error("Please provide at least one layout name.");
      }
      break;
    case "list":
      listLayouts();
      break;
    case "remove":
      if (names.length > 0) {
        removeLayout(names);
      } else {
        console.error("Please provide at least one layout name to remove.");
      }
      break;
    case "rename":
      if (names.length === 2) {
        renameLayout(names[0], names[1]);
      } else {
        console.error("Usage: react layout rename <oldName> <newName>");
      }
      break;
    case "info":
      layoutInfo(names[0]);
      break;
    case "unused":
      listUnusedLayouts();
      break;
    case "help":
      showLayoutHelp();
      break;
    default:
      console.log(
        "Usage: react layout <create|list|remove|rename|info|unused|help> ..."
      );
  }
} else if (type === "page" || type === "pages") {
  if (action === "create" && names.length > 0) {
    const capitalizedNames = names.map(capitalizeFirstLetter);
    createPage(capitalizedNames);
  } else {
    console.error("Usage: react page create <name> [<name2> ...]");
  }
} else if (type === "project" || type === "projects") {
  if (action === "create" && names.length === 1) {
    createProject(names[0]);
  } else {
    console.error("Usage: react project create <name>");
  }
} else if (type === "service" || type === "services") {
  if (action === "create" && names.length > 0) {
    const capitalizedNames = names.map(capitalizeFirstLetter);
    createService(capitalizedNames);
  } else {
    console.error("Usage: react service create <name> [<name2> ...]");
  }
} else if (type === "lines" && action === "help") {
  showLinesHelp();
} else if (type === "lines" && action === "count") {
  // Slimme parsing: eerste argument extensie of subfolder
  let extFilter = undefined;
  let subfolderFilter = undefined;

  if (names.length > 0) {
    // Kijk of eerste argument een bekende extensie is
    const knownExts = [
      "js",
      "jsx",
      "ts",
      "tsx",
      "css",
      "scss",
      "html",
      "md",
      "vue",
      "json",
    ];
    if (knownExts.includes(names[0].replace(/^\./, ""))) {
      extFilter = names[0];
      if (names[1]) subfolderFilter = names[1];
    } else {
      subfolderFilter = names[0];
      if (names[1]) extFilter = names[1];
    }
  }

  countLines(subfolderFilter, extFilter);
} else {
  console.log(
    "Usage: react component <create|remove|list|rename|info|test|unused|help> ...\n" +
      "       react layout <create|list|remove|rename|info|unused|help> ...\n" +
      "       react page create <name> [<name2> ...]\n" +
      "       react project create <name>\n" +
      "       react service create <name> [<name2> ...]\n" +
      "       react lines count"
  );
}
