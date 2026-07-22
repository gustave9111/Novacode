const fs = require("fs");
const { cheminComplet } = require("../core/fichiers");
const { memoriserProjet } = require("../core/projects");

module.exports = {
  nom: "ouvrir",
  aliases: ["open", "cd"],
  description: "Charge un projet : ouvrir <dossier>",

  executer(contexte, args) {
    const argument = args.join(" ");

    if (!argument) {
      console.log("\nUtilisation : ouvrir <dossier>");
      return;
    }

    const dossier = cheminComplet(argument);

    if (!fs.existsSync(dossier) || !fs.statSync(dossier).isDirectory()) {
      console.log("\nErreur : ce dossier n’existe pas.");
      return;
    }

    contexte.projetCourant = dossier;
    memoriserProjet(dossier);

    console.log("\n✓ Projet chargé");
    console.log(`  ${dossier}`);
  }
};
