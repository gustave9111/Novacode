const path = require("path");
const {
  rechercherDansProjet
} = require("../core/recherche");

module.exports = {
  nom: "recherche",
  aliases: ["chercher", "search"],
  description: "Recherche du texte : recherche <texte>",

  executer(contexte, args) {
    const terme = args.join(" ");

    if (!terme) {
      console.log("\nUtilisation : recherche <texte>");
      return;
    }

    const resultat = rechercherDansProjet(
      contexte.projetCourant,
      terme
    );

    if (!resultat.succes) {
      console.log(`\nErreur : ${resultat.erreur}`);
      return;
    }

    if (resultat.nombreResultats === 0) {
      console.log(`\nAucun résultat pour "${terme}".`);
      return;
    }

    console.log(
      `\n${resultat.nombreResultats} résultat(s) pour "${terme}"`
    );

    let fichierPrecedent = null;

    for (const element of resultat.resultats) {
      const fichier = path.relative(
        contexte.projetCourant,
        element.fichier
      );

      if (fichier !== fichierPrecedent) {
        console.log(`\n📄 ${fichier}`);
        fichierPrecedent = fichier;
      }

      const contenu =
        element.contenu.length > 120
          ? `${element.contenu.slice(0, 117)}...`
          : element.contenu;

      console.log(
        `   ${String(element.ligne).padStart(4)} │ ${contenu}`
      );
    }
  }
};
