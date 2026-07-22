const {
  chargerConfigIA,
  sauvegarderConfigIA,
  fichier
} = require("../ai/config");

const {
  obtenirStatut
} = require("../ai/manager");

module.exports = {
  nom: "ia",
  aliases: ["ai"],
  description:
    "Configure Gemini : ia, ia modele <nom>",

  async executer(contexte, args) {
    const config = chargerConfigIA();
    const action =
      (args[0] || "").toLowerCase();

    if (action === "utiliser") {
      const provider =
        (args[1] || "").toLowerCase();

      if (provider !== "gemini") {
        console.log(
          "\nUtilisation : ia utiliser gemini"
        );
        return;
      }

      config.provider = "gemini";
      sauvegarderConfigIA(config);

      console.log(
        "\n✓ Fournisseur sélectionné : gemini"
      );
      return;
    }

    if (action === "modele") {
      const modele =
        args.slice(1).join(" ").trim();

      if (!modele) {
        console.log(
          "\nUtilisation : ia modele <nom>"
        );
        return;
      }

      config.gemini.model = modele;
      sauvegarderConfigIA(config);

      console.log(
        `\n✓ Modèle Gemini : ${modele}`
      );
      return;
    }

    const statut =
      await obtenirStatut(config);

    console.log("\nConfiguration IA");
    console.log("─".repeat(50));
    console.log(`Fichier : ${fichier}`);
    console.log(
      `Fournisseur : ${statut.provider}`
    );
    console.log(`Modèle : ${statut.model}`);
    console.log(
      `Clé API : ${
        statut.clePresente
          ? "présente"
          : "absente"
      }`
    );
    console.log(
      `Connexion : ${
        statut.connecte
          ? "fonctionnelle"
          : "non vérifiée"
      }`
    );

    if (!statut.clePresente) {
      console.log(
        "\nDéfinis GEMINI_API_KEY avant " +
        "de lancer NovaCode."
      );
    } else if (!statut.connecte) {
      console.log(
        "\nLa clé est présente, mais Gemini " +
        "n’a pas pu être joint. Vérifie la clé, " +
        "Internet et le nom du modèle."
      );
    }
  }
};
