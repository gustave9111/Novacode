module.exports = {
  nom: "aide",
  aliases: ["help"],
  description: "Affiche les commandes disponibles",

  executer(contexte) {
    console.log("\nCommandes disponibles\n");
    console.log("─".repeat(60));

    const commandesUniques = new Map();

    for (const commande of contexte.registre.values()) {
      commandesUniques.set(commande.nom, commande);
    }

    const commandes = [...commandesUniques.values()]
      .sort((a, b) => a.nom.localeCompare(b.nom));

    for (const commande of commandes) {
      console.log(
        `${commande.nom.padEnd(14)} ${commande.description || ""}`
      );
    }
  }
};
