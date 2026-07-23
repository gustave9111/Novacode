const {
  planifierDemande
} = require("../ai/planner");

module.exports = {
  nom: "plan",
  aliases: ["planner"],
  description:
    "Affiche le plan d’outils : plan <demande>",

  executer(contexte, args) {
    const demande = args.join(" ").trim();

    if (!demande) {
      console.log("\nUtilisation : plan <demande>");
      return;
    }

    const plan = planifierDemande(
      demande,
      contexte.projetCourant
    );

    if (!plan.succes) {
      console.log(`\nErreur : ${plan.erreur}`);
      return;
    }

    console.log("\n🧠 NovaCode Planner");
    console.log("─".repeat(60));
    console.log(`Projet : ${plan.projet}`);
    console.log(`Demande : ${plan.demande}`);
    console.log(`Type détecté : ${plan.type}`);
    console.log(
      `Mode : ${
        plan.lectureSeule
          ? "lecture seule"
          : "modification"
      }`
    );

    console.log("\nPlan proposé :");

    for (const etape of plan.etapes) {
      console.log(
        `\n${etape.ordre}. ${etape.outil}`
      );

      console.log(
        `   Pourquoi : ${etape.raison}`
      );

      if (
        Object.keys(etape.parametres).length > 0
      ) {
        console.log(
          `   Paramètres : ${
            JSON.stringify(etape.parametres)
          }`
        );
      }
    }

    console.log(
      "\nAucun outil n’a été exécuté."
    );
  }
};
