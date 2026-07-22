const {
  creerSnapshot
} = require("../core/snapshot");

module.exports = {
  nom: "snapshot",
  aliases: ["sauvegarde"],
  description: "Crée une sauvegarde du projet",

  executer(contexte) {
    console.log("\nCréation du snapshot...");

    const resultat = creerSnapshot(
      contexte.projetCourant
    );

    if (!resultat.succes) {
      console.log(`\nErreur : ${resultat.erreur}`);
      return;
    }

    console.log("\n✓ Snapshot créé");
    console.log(`  ${resultat.nom}`);
  }
};
