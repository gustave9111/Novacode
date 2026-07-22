const path = require("path");
const { lireFichier, cheminComplet } = require("../core/fichiers");

function obtenirChemin(contexte, argument) {
  if (
    argument === "~" ||
    argument.startsWith("~/") ||
    path.isAbsolute(argument)
  ) {
    return cheminComplet(argument);
  }

  return path.resolve(contexte.projetCourant, argument);
}

module.exports = {
  nom: "lire",
  aliases: ["cat"],
  description: "Lit un fichier : lire <fichier>",

  executer(contexte, args) {
    const argument = args.join(" ");

    if (!argument) {
      console.log("\nUtilisation : lire <fichier>");
      return;
    }

    const fichier = obtenirChemin(contexte, argument);
    const resultat = lireFichier(fichier);

    if (!resultat.succes) {
      console.log(`\nErreur : ${resultat.erreur}`);
      return;
    }

    console.log(`\nFichier : ${resultat.chemin}`);
    console.log(`Lignes : ${resultat.nombreLignes}\n`);
    console.log("─".repeat(75));

    resultat.lignes.forEach((ligne, index) => {
      console.log(
        `${String(index + 1).padStart(4)} │ ${ligne}`
      );
    });

    console.log("─".repeat(75));
  }
};
