const path = require("path");
const { analyserStats } = require("../core/stats");

function formaterTaille(octets) {
  if (octets < 1024) {
    return `${octets} octets`;
  }

  if (octets < 1024 ** 2) {
    return `${(octets / 1024).toFixed(1)} Ko`;
  }

  if (octets < 1024 ** 3) {
    return `${(octets / 1024 ** 2).toFixed(1)} Mo`;
  }

  return `${(octets / 1024 ** 3).toFixed(1)} Go`;
}

module.exports = {
  nom: "stats",
  description: "Affiche les statistiques du projet",

  executer(contexte) {
    try {
      const resultat = analyserStats(contexte.projetCourant);

      console.log(
        `\nStatistiques : ${path.basename(contexte.projetCourant)}`
      );
      console.log("─".repeat(55));
      console.log(`📁 Dossiers : ${resultat.dossiers}`);
      console.log(`📄 Fichiers : ${resultat.fichiers}`);
      console.log(`🧾 Lignes : ${resultat.lignes}`);
      console.log(`💾 Taille : ${formaterTaille(resultat.taille)}`);

      const extensions = Object.entries(resultat.extensions)
        .sort((a, b) => b[1] - a[1]);

      if (extensions.length > 0) {
        console.log("\nExtensions :");

        for (const [extension, nombre] of extensions) {
          console.log(`  ${extension} : ${nombre}`);
        }
      }

      if (resultat.plusGrosFichier.nom) {
        console.log("\nPlus gros fichier texte :");
        console.log(`  ${resultat.plusGrosFichier.nom}`);
        console.log(
          `  ${resultat.plusGrosFichier.lignes} lignes`
        );
      }
    } catch (erreur) {
      console.log(`\nErreur : ${erreur.message}`);
    }
  }
};
