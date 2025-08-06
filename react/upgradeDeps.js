const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function upgradeDependencies() {
  console.log("🚀 Dependency Upgrade - Controle gestart...\n");

  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ Geen package.json gevonden!");
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    if (
      Object.keys(dependencies).length === 0 &&
      Object.keys(devDependencies).length === 0
    ) {
      console.log("📦 Geen dependencies gevonden om te upgraden.");
      return;
    }

    console.log("📋 Huidige dependencies worden gecontroleerd...");

    // Check for outdated packages
    try {
      const outdatedOutput = execSync("npm outdated --json", {
        encoding: "utf8",
        stdio: "pipe",
      });
      const outdated = JSON.parse(outdatedOutput);

      if (Object.keys(outdated).length === 0) {
        console.log("✅ Alle dependencies zijn al up-to-date!");
        return;
      }

      console.log("\n📊 OUTDATED PACKAGES:");
      console.log("=".repeat(80));
      console.log(
        "Package".padEnd(25) +
          "Current".padEnd(15) +
          "Wanted".padEnd(15) +
          "Latest"
      );
      console.log("=".repeat(80));

      Object.entries(outdated).forEach(([pkg, info]) => {
        console.log(
          pkg.padEnd(25) +
            info.current.padEnd(15) +
            info.wanted.padEnd(15) +
            info.latest
        );
      });

      console.log(
        "\n🔧 Wil je alle packages upgraden naar de laatste versie? (y/N)"
      );

      // Voor demo doeleinden upgraden we automatisch (in echte app zou je user input vragen)
      console.log("🚀 Upgrading packages...");

      // Update to latest versions
      Object.keys(outdated).forEach((pkg) => {
        try {
          console.log(`📦 Upgrading ${pkg}...`);
          execSync(`npm install ${pkg}@latest`, { stdio: "inherit" });
        } catch (error) {
          console.error(`❌ Failed to upgrade ${pkg}`);
        }
      });

      console.log(
        "\n✅ Upgrade voltooid! Voer 'npm audit' uit om security issues te controleren."
      );
    } catch (error) {
      // No outdated packages or npm outdated failed
      if (error.status === 1) {
        console.log("✅ Alle dependencies zijn al up-to-date!");
      } else {
        console.error(
          "❌ Fout bij controleren van outdated packages:",
          error.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Fout bij lezen van package.json:", error.message);
  }
}

function checkSecurityIssues() {
  console.log("\n🔒 Security audit gestart...");

  try {
    execSync("npm audit", { stdio: "inherit" });
  } catch (error) {
    console.log(
      "💡 Voer 'npm audit fix' uit om automatische fixes toe te passen."
    );
  }
}

function showUpgradeHelp() {
  console.log(`
✨ React Upgrade Dependencies Help ✨

Met dit commando kun je je package dependencies up-to-date houden:

  🚀  upgrade-deps
      ➔ Controleert alle dependencies op updates
      ➔ Toont een overzicht van outdated packages
      ➔ Optie om alle packages te upgraden naar latest versie
      ➔ Voert een security audit uit

  🔒  upgrade-deps --security
      ➔ Voert alleen een security audit uit
      ➔ Toont bekende vulnerabilities

  📊  upgrade-deps --check
      ➔ Toont alleen outdated packages zonder te upgraden

Voorbeelden:
  react upgrade-deps              ➔ Volledige upgrade workflow
  react upgrade-deps --check     ➔ Alleen controleren
  react upgrade-deps --security  ➔ Alleen security audit

💡 Tips:
  - Maak altijd een backup voor grote upgrades
  - Test je app na het upgraden
  - Controleer breaking changes in changelogs
  `);
}

module.exports = {
  upgradeDependencies,
  checkSecurityIssues,
  showUpgradeHelp,
};
