const { genererArbre } = require("../core/arbre");

module.exports = {
  nom: "arbre",
  aliases: ["tree"],
  description: "Affiche l’arbre du projet : arbre [profondeur]",

  executer(contexte, args) {
    const profondeur = args[0]
      ? Number.parseInt(args[0], 10)
      : 5;

    if (
      !Number.isInteger(profondeur) ||
      profondeur < 1 ||
      profondeur > 20
    ) {
      console.log(
        "\nLa profondeur doit être entre 1 et 20."
      );
      return;
    }

    const resultat = genererArbre(
      contexte.projetCourant,
      { profondeurMax: profondeur }
    );

    if (!resultat.succes) {
      console.log(`\nErreur : ${resultat.erreur}`);
      return;
    }

    console.log("");

    for (const ligne of resultat.lignes) {
      console.log(ligne);
    }
  }
};
