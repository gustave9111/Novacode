const { expliquerErreur } = require("../core/erreurs");

module.exports = {
  nom: "erreur",
  aliases: ["expliquer"],
  description: "Explique une erreur : erreur <message>",

  executer(contexte, args) {
    const message = args.join(" ");

    if (!message) {
      console.log('\nUtilisation : erreur "message d’erreur"');
      return;
    }

    const resultat = expliquerErreur(message);

    console.log(`\n${resultat.titre}`);
    console.log("─".repeat(resultat.titre.length));
    console.log(`\nExplication : ${resultat.explication}`);
    console.log(`\nSolution : ${resultat.solution}`);
  }
};
