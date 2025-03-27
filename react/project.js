const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function createProject(name) {
  const repoUrl = "https://github.com/PieterJanDelie/react.git";
  const projectPath = path.join(process.cwd(), name);

  try {
    console.log(`Cloning repository from ${repoUrl}...`);
    execSync(`git clone ${repoUrl} ${projectPath}`, { stdio: "inherit" });

    console.log(`Removing .git folder...`);
    fs.rmSync(path.join(projectPath, ".git"), { recursive: true, force: true });

    process.chdir(projectPath);
    console.log(`Running npm install...`);
    execSync("npm install", { stdio: "inherit" });

    console.log(`Initializing a new Git repository...`);
    execSync("git init", { stdio: "inherit" });

    execSync("git add .", { stdio: "inherit" });
    execSync('git commit -m "Initial commit"', { stdio: "inherit" });
    
    console.log(`Opening project in VS Code...`);
    execSync("code .", { stdio: "inherit" });

    console.log(`Project '${name}' created successfully.`);
  } catch (error) {
    console.error(`Error creating project: ${error.message}`);
  }
}

module.exports = createProject;
