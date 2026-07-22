const fs = require("fs");
const { chargerProjets, memoriserProjet } = require("../core/projects");

module.exports = {
  nom: "projets",
  aliases: ["projects", "recent"],
  description: "Liste ou ouvre les projets récents",

  executer(contexte, args) {
    const projets = chargerProjets();

    if (args[0]) {
      const numero = Number.parseInt(args[0], 10);
      const projet = projets[numero - 1];

      if (!projet) {
        console.log("\nNuméro de projet invalide.");
        return;
      }

      if (!fs.existsSync(projet.chemin)) {
        console.log("\nCe projet n’existe plus.");
        return;
      }

      contexte.projetCourant = projet.chemin;
      memoriserProjet(projet.chemin);
      console.log(`\n✓ Projet chargé : ${projet.chemin}`);
      return;
    }

    if (projets.length === 0) {
      console.log("\nAucun projet récent.");
      return;
    }

    console.log("\nProjets récents :\n");

    projets.forEach((projet, index) => {
      console.log(`${index + 1}. ${projet.nom}`);
      console.log(`   ${projet.chemin}`);
    });

    console.log("\nUtilise : projets <numéro>");
  }
};
