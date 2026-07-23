module.exports = {
  nom: "shell-history",
  aliases: ["historique-shell"],
  description:
    "Affiche les commandes du terminal intégré",

  executer(contexte) {
    if (
      !contexte.historiqueShell ||
      contexte.historiqueShell.length === 0
    ) {
      console.log(
        "\nHistorique du terminal vide."
      );

      return;
    }

    console.log(
      "\nHistorique du terminal :\n"
    );

    contexte.historiqueShell.forEach(
      (element, index) => {
        console.log(
          `${index + 1}. !${element.commande}`
        );

        console.log(
          `   Dossier : ${element.dossier}`
        );

        console.log(
          `   Code : ${element.code}`
        );
      }
    );
  }
};
