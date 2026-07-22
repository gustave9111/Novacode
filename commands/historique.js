module.exports = {
  nom: "historique",
  aliases: ["history"],
  description: "Affiche l’historique des commandes",

  executer(contexte) {
    if (contexte.historique.length === 0) {
      console.log("\nHistorique vide.");
      return;
    }

    console.log("\nHistorique :\n");

    contexte.historique.forEach((commande, index) => {
      console.log(`${index + 1}. ${commande}`);
    });
  }
};
