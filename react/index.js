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
const {
  createPage,
  listPages,
  removePage,
  renamePage,
  pageInfo,
  listUnusedPages,
  showPageHelp,
} = require("./page");
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

function handleComponentCommands() {
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
}

function handleLayoutCommands() {
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
}

function handlePageCommands() {
  switch (action) {
    case "create":
      if (names.length > 0) {
        const capitalizedNames = names.map(capitalizeFirstLetter);
        createPage(capitalizedNames);
      } else {
        console.error("Usage: react page create <name> [<name2> ...]");
      }
      break;
    case "list":
      listPages();
      break;
    case "remove":
      if (names.length > 0) {
        removePage(names);
      } else {
        console.error("Usage: react page remove <name> [<name2> ...]");
      }
      break;
    case "rename":
      if (names.length === 2) {
        renamePage(names[0], names[1]);
      } else {
        console.error("Usage: react page rename <oldName> <newName>");
      }
      break;
    case "info":
      pageInfo(names[0]);
      break;
    case "unused":
      listUnusedPages();
      break;
    case "help":
      showPageHelp();
      break;
    default:
      console.log(
        "Usage: react page <create|list|remove|rename|info|unused|help> ..."
      );
  }
}

function handleProjectCommands() {
  if (action === "create" && names.length === 1) {
    createProject(names[0]);
  } else {
    console.error("Usage: react project create <name>");
  }
}

function handleServiceCommands() {
  switch (action) {
    case "create":
      if (names.length > 0) {
        const capitalizedNames = names.map(capitalizeFirstLetter);
        createService(capitalizedNames);
      } else {
        console.error("Usage: react service create <name> [<name2> ...]");
      }
      break;
    case "list":
      listServices();
      break;
    case "remove":
      if (names.length > 0) {
        removeService(names);
      } else {
        console.error("Usage: react service remove <name> [<name2> ...]");
      }
      break;
    case "rename":
      if (names.length === 2) {
        renameService(names[0], names[1]);
      } else {
        console.error("Usage: react service rename <oldName> <newName>");
      }
      break;
    case "info":
      serviceInfo(names[0]);
      break;
    case "unused":
      listUnusedServices();
      break;
    case "help":
      showServiceHelp();
      break;
    default:
      console.log(
        "Usage: react service <create|list|remove|rename|info|unused|help> ..."
      );
  }
}

function handleLinesCommands() {
  if (action === "help") {
    showLinesHelp();
    return;
  }
  if (action === "count") {
    // Slimme parsing: eerste argument extensie of subfolder
    let extFilter = undefined;
    let subfolderFilter = undefined;
    if (names.length > 0) {
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
    return;
  }
  console.log(
    "Usage: react lines count [<subfolder>] [<ext>]\n       react lines help"
  );
}

// Main command router
if (type === "component" || type === "components") {
  handleComponentCommands();
} else if (type === "layout" || type === "layouts") {
  handleLayoutCommands();
} else if (type === "page" || type === "pages") {
  handlePageCommands();
} else if (type === "project" || type === "projects") {
  handleProjectCommands();
} else if (type === "service" || type === "services") {
  handleServiceCommands();
} else if (type === "lines") {
  handleLinesCommands();
} else {
  console.log(`
==================== ✨ React CLI - Command Overzicht ✨ ====================

================ COMPONENTS =================
react component <create|remove|list|rename|info|test|unused|help> ...
  🛠️  create <naam> [<naam2> ...]     ➔ Maak component(en) aan
  🗑️  remove <naam> [<naam2> ...]     ➔ Verwijder component(en)
  📦  list                            ➔ Toon alle componenten
  🔄  rename <oud> <nieuw>            ➔ Hernoem component
  🔍  info [naam]                     ➔ Info over component(en)
  🧪  test <naam> [<naam2> ...]       ➔ Maak testbestand aan
  💤  unused                          ➔ Toon ongebruikte componenten
  ❓  help                            ➔ Toon component help

================ LAYOUTS ====================
react layout <create|list|remove|rename|info|unused|help> ...
  🛠️  create <naam> [<naam2> ...]     ➔ Maak layout(s) aan
  🗑️  remove <naam> [<naam2> ...]     ➔ Verwijder layout(s)
  📦  list                            ➔ Toon alle layouts
  🔄  rename <oud> <nieuw>            ➔ Hernoem layout
  🔍  info [naam]                     ➔ Info over layout(s)
  💤  unused                          ➔ Toon ongebruikte layouts
  ❓  help                            ➔ Toon layout help

================ PAGES ======================
react page <create|list|remove|rename|info|unused|help> ...
  🛠️  create <naam> [<naam2> ...]     ➔ Maak page(s) aan
  🗑️  remove <naam> [<naam2> ...]     ➔ Verwijder page(s)
  📚  list                            ➔ Toon alle pages
  🔄  rename <oud> <nieuw>            ➔ Hernoem page
  🔍  info [naam]                     ➔ Info over page(s)
  💤  unused                          ➔ Toon ongebruikte pages
  ❓  help                            ➔ Toon page help

================ PROJECTS ===================
react project create <name>
  🚀  create <naam>                   ➔ Maak een nieuw project

================ SERVICES ===================
react service <create|list|remove|rename|info|unused|help> ...
  🛠️  create <naam> [<naam2> ...]     ➔ Maak service(s) aan
  🗑️  remove <naam> [<naam2> ...]     ➔ Verwijder service(s)
  📦  list                            ➔ Toon alle services
  🔄  rename <oud> <nieuw>            ➔ Hernoem service
  🔍  info [naam]                     ➔ Info over service(s)
  💤  unused                          ➔ Toon ongebruikte services
  ❓  help                            ➔ Toon service help

================ LINES ======================
react lines count [<subfolder>] [<ext>]
react lines help
  📊  count                           ➔ Tel regels code (optioneel per map/extensie)
  ❓  help                            ➔ Toon uitleg over lines count
`);
}
