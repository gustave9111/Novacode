const fs = require("fs");
const path = require("path");

const { planifierOutils } = require("./planner");

const {
  executerAnalyse,
  executerStats,
  executerDoctor,
  executerArbre,
  executerRecherche,
  executerTodo
} = require("./tools");

const { demanderIA } = require("./manager");

function lireFichierMentionne(
  projetCourant,
  fichierUtilisateur
) {
  if (!fichierUtilisateur) {
    return null;
  }

  const fichier = path.resolve(
    projetCourant,
    fichierUtilisateur
  );

  if (
    !fs.existsSync(fichier) ||
    !fs.statSync(fichier).isFile()
  ) {
    return {
      chemin: fichierUtilisateur,
      erreur: "Fichier introuvable"
    };
  }

  try {
    const contenu = fs.readFileSync(fichier, "utf8");
    const limite = 16000;

    return {
      chemin: path.relative(projetCourant, fichier),
      contenu:
        contenu.length <= limite
          ? contenu
          : contenu.slice(0, limite) +
            "\n\n[Contenu coupé par NovaCode]"
    };
  } catch (erreur) {
    return {
      chemin: fichierUtilisateur,
      erreur: erreur.message
    };
  }
}

function executerPlan(plan, projetCourant) {
  const resultats = [];

  for (const outil of plan.outils) {
    switch (outil) {
      case "analyse":
        resultats.push(executerAnalyse(projetCourant));
        break;

      case "stats":
        resultats.push(executerStats(projetCourant));
        break;

      case "doctor":
        resultats.push(executerDoctor(projetCourant));
        break;

      case "todo":
        resultats.push(executerTodo(projetCourant));
        break;

      case "arbre":
        resultats.push(executerArbre(projetCourant, 3));
        break;

      case "recherche":
        if (plan.termeRecherche) {
          resultats.push(
            executerRecherche(
              projetCourant,
              plan.termeRecherche
            )
          );
        }
        break;
    }
  }

  return resultats;
}

function construirePromptAgent({
  projetCourant,
  question,
  plan,
  resultats,
  fichier
}) {
  return [
    "Tu es NovaCode, un assistant de programmation.",
    "Réponds en français canadien.",
    "Sois concret, honnête et adapté au projet analysé.",
    "Base ta réponse uniquement sur les données fournies.",
    "N'invente jamais un fichier, une fonction ou un résultat.",
    "Tu es en mode lecture seule.",
    "Ne prétends jamais avoir créé ou modifié un fichier.",
    "",
    `Projet courant : ${projetCourant}`,
    `Question : ${question}`,
    "",
    "Outils choisis par NovaCode :",
    JSON.stringify(plan, null, 2),
    "",
    "Résultats des outils :",
    JSON.stringify(resultats, null, 2),
    fichier
      ? [
          "",
          "Fichier mentionné :",
          JSON.stringify(fichier, null, 2)
        ].join("\n")
      : "",
    "",
    "Donne maintenant une réponse utile à l'utilisateur.",
    "Lorsque tu proposes des changements, précise qu'ils ne sont pas encore appliqués."
  ].filter(Boolean).join("\n");
}

async function executerAgent({
  config,
  projetCourant,
  question,
  afficherProgression = () => {}
}) {
  const plan = planifierOutils(question);

  afficherProgression(
    `Outils choisis : ${plan.outils.join(", ") || "aucun"}`
  );

  const resultats = executerPlan(
    plan,
    projetCourant
  );

  const fichier = lireFichierMentionne(
    projetCourant,
    plan.fichier
  );

  const prompt = construirePromptAgent({
    projetCourant,
    question,
    plan,
    resultats,
    fichier
  });

  const reponse = await demanderIA(config, prompt);

  return {
    plan,
    resultats,
    reponse
  };
}

module.exports = {
  executerAgent
};
