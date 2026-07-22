const { chargerConfigIA } = require("../ai/config");
const { executerAgent } = require("../ai/agent");

module.exports = {
  nom: "ask",
  aliases: ["demande"],
  description: "Interroge l’agent IA : ask <question>",

  async executer(contexte, args) {
    const question = args.join(" ").trim();

    if (!question) {
      console.log("\nUtilisation : ask <question>");
      return;
    }

    const config = chargerConfigIA();

    console.log(
      `\nAgent NovaCode — ${config.provider}/${config.model || config.gemini?.model || "modèle configuré"}`
    );
    console.log("─".repeat(60));

    const resultat = await executerAgent({
      config,
      projetCourant: contexte.projetCourant,
      question,

      afficherProgression(message) {
        console.log(`→ ${message}`);
      }
    });

    console.log("\nRéponse");
    console.log("─".repeat(60));
    console.log(resultat.reponse);
  }
};
