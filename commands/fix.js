const fs = require("fs");
const path = require("path");

const {
  analyserProblemesProjet
} = require("../core/fix");

const {
  chargerConfigIA
} = require("../ai/config");

const {
  demanderIA
} = require("../ai/manager");

function lireFichierCible(projetCourant, argument) {
  if (!argument) {
    return null;
  }

  const chemin = path.resolve(projetCourant, argument);

  if (
    !fs.existsSync(chemin) ||
    !fs.statSync(chemin).isFile()
  ) {
    return {
      chemin: argument,
      erreur: "Fichier introuvable"
    };
  }

  try {
    const contenu = fs.readFileSync(chemin, "utf8");
    const limite = 16000;

    return {
      chemin: path.relative(projetCourant, chemin),
      contenu:
        contenu.length <= limite
          ? contenu
          : contenu.slice(0, limite) +
            "\n\n[Contenu coupé par NovaCode]"
    };
  } catch (erreur) {
    return {
      chemin: argument,
      erreur: erreur.message
    };
  }
}

function construirePrompt({
  projetCourant,
  diagnostic,
  fichierCible
}) {
  return [
    "Tu es NovaCode, un assistant de programmation.",
    "Réponds en français canadien.",
    "Analyse le diagnostic technique fourni.",
    "Explique les erreurs précisément et simplement.",
    "Classe les problèmes par priorité.",
    "Propose des corrections concrètes.",
    "Tu es strictement en lecture seule.",
    "Ne prétends jamais avoir modifié un fichier.",
    "N'invente aucune erreur absente des résultats.",
    "",
    `Projet : ${projetCourant}`,
    "",
    "Diagnostic automatique :",
    JSON.stringify(diagnostic, null, 2),
    fichierCible
      ? [
          "",
          "Fichier demandé :",
          JSON.stringify(fichierCible, null, 2)
        ].join("\n")
      : "",
    "",
    "Donne :",
    "1. un résumé du problème;",
    "2. les erreurs prioritaires;",
    "3. les commandes ou modifications recommandées;",
    "4. ce qui fonctionne déjà correctement.",
    "",
    "Rappelle que les changements proposés ne sont pas appliqués."
  ].filter(Boolean).join("\n");
}

module.exports = {
  nom: "fix",
  aliases: ["diagnose"],
  description: "Diagnostique les erreurs : fix [fichier]",

  async executer(contexte, args) {
    const fichierDemande = args.join(" ").trim();

    console.log("\nNovaCode Fix — diagnostic en lecture seule");
    console.log("─".repeat(60));

    console.log("→ Vérification de la syntaxe JavaScript");
    console.log("→ Exécution des tests disponibles");
    console.log("→ Analyse Doctor");
    console.log("→ Vérification de Git\n");

    const diagnostic = await analyserProblemesProjet(
      contexte.projetCourant
    );

    const fichierCible = lireFichierCible(
      contexte.projetCourant,
      fichierDemande
    );

    console.log("Résumé local");
    console.log("─".repeat(60));
    console.log(
      `Score Doctor : ${
        diagnostic.doctor.score ?? "indisponible"
      }`
    );
    console.log(
      `Fichiers JS vérifiés : ${
        diagnostic.syntaxe.fichiersVerifies
      }`
    );
    console.log(
      `Erreurs de syntaxe : ${
        diagnostic.syntaxe.erreurs.length
      }`
    );

    if (diagnostic.tests.execute) {
      console.log(
        `Tests : ${
          diagnostic.tests.succes ? "réussis" : "échoués"
        }`
      );
    } else {
      console.log(
        `Tests : non exécutés (${diagnostic.tests.raison})`
      );
    }

    if (diagnostic.git.execute) {
      console.log(
        diagnostic.git.stdout
          ? "Git : modifications détectées"
          : "Git : aucun changement détecté"
      );
    } else {
      console.log(
        `Git : non vérifié (${diagnostic.git.raison})`
      );
    }

    const config = chargerConfigIA();

    console.log("\n→ Analyse du diagnostic par l’IA...\n");

    const prompt = construirePrompt({
      projetCourant: contexte.projetCourant,
      diagnostic,
      fichierCible
    });

    const reponse = await demanderIA(config, prompt);

    console.log("Diagnostic NovaCode");
    console.log("─".repeat(60));
    console.log(reponse);
  }
};
