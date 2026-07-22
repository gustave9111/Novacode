const fs = require("fs");
const path = require("path");
const { memoriserProjet } = require("../core/projects");

function creerFichier(chemin, contenu) {
  fs.writeFileSync(chemin, contenu, { flag: "wx" });
}

module.exports = {
  nom: "init",
  description: "Crée un projet : init <nom> [node|basic]",

  executer(contexte, args) {
    const nom = args[0];
    const type = (args[1] || "node").toLowerCase();

    if (!nom || !["node", "basic"].includes(type)) {
      console.log("\nUtilisation : init <nom> [node|basic]");
      return;
    }

    const destination = path.resolve(contexte.projetCourant, nom);

    if (fs.existsSync(destination)) {
      console.log("\nErreur : ce dossier existe déjà.");
      return;
    }

    fs.mkdirSync(path.join(destination, "src"), { recursive: true });
    fs.mkdirSync(path.join(destination, "tests"), { recursive: true });
    fs.mkdirSync(path.join(destination, "docs"), { recursive: true });

    creerFichier(
      path.join(destination, "README.md"),
      `# ${nom}\n\nProjet créé avec NovaCode.\n`
    );

    creerFichier(
      path.join(destination, ".gitignore"),
      "node_modules/\ndist/\nbuild/\n.env\n.snapshots/\n"
    );

    creerFichier(
      path.join(destination, "LICENSE"),
      `Copyright (c) ${new Date().getFullYear()}\n\nAll rights reserved.\n`
    );

    if (type === "node") {
      creerFichier(
        path.join(destination, "package.json"),
        JSON.stringify({
          name: nom.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
          version: "1.0.0",
          private: true,
          main: "src/index.js",
          scripts: {
            start: "node src/index.js",
            test: "node --test"
          }
        }, null, 2) + "\n"
      );

      creerFichier(
        path.join(destination, "src", "index.js"),
        `console.log("${nom} fonctionne!");\n`
      );
    }

    contexte.projetCourant = destination;
    memoriserProjet(destination);

    console.log("\n✓ Projet créé");
    console.log(`  ${destination}`);
    console.log(`  Type : ${type}`);
  }
};
