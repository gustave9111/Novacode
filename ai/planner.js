const path = require("path");

const OUTILS_AUTORISES = new Set([
  "analyse",
  "doctor",
  "stats",
  "todo",
  "arbre",
  "recherche",
  "lire",
  "fix",
  "git-status",
  "tests"
]);

function ajouterEtape(plan, outil, raison, parametres = {}) {
  if (!OUTILS_AUTORISES.has(outil)) {
    return;
  }

  const existeDeja = plan.etapes.some(etape => {
    return (
      etape.outil === outil &&
      JSON.stringify(etape.parametres) ===
        JSON.stringify(parametres)
    );
  });

  if (existeDeja) {
    return;
  }

  plan.etapes.push({
    ordre: plan.etapes.length + 1,
    outil,
    raison,
    parametres
  });
}

function detecterFichiers(question) {
  const correspondances = question.match(
    /(?:^|\s)([\w./-]+\.[a-zA-Z0-9]+)(?=\s|$|[?!,;:])/g
  );

  if (!correspondances) {
    return [];
  }

  return correspondances.map(element => {
    return element.trim();
  });
}

function extraireTermeRecherche(question) {
  const expressions = [
    /où (?:est|sont) utilisée?s?\s+(.+?)[?.!]*$/i,
    /où (?:est|sont) défini(?:e|s)?\s+(.+?)[?.!]*$/i,
    /cherche\s+["']?(.+?)["']?[?.!]*$/i,
    /recherche\s+["']?(.+?)["']?[?.!]*$/i,
    /trouve\s+["']?(.+?)["']?[?.!]*$/i
  ];

  for (const expression of expressions) {
    const resultat = question.match(expression);

    if (resultat) {
      return resultat[1].trim();
    }
  }

  return null;
}

function classerDemande(question) {
  const texte = question.toLowerCase();

  if (
    texte.includes("corrige") ||
    texte.includes("répare") ||
    texte.includes("repare") ||
    texte.includes("bug") ||
    texte.includes("erreur")
  ) {
    return "correction";
  }

  if (
    texte.includes("ajoute") ||
    texte.includes("crée") ||
    texte.includes("cree") ||
    texte.includes("implémente") ||
    texte.includes("implemente")
  ) {
    return "creation";
  }

  if (
    texte.includes("explique") ||
    texte.includes("comprend") ||
    texte.includes("décris") ||
    texte.includes("decris")
  ) {
    return "explication";
  }

  if (
    texte.includes("améliore") ||
    texte.includes("ameliore") ||
    texte.includes("review") ||
    texte.includes("revue")
  ) {
    return "amelioration";
  }

  if (
    texte.includes("test") ||
    texte.includes("npm test")
  ) {
    return "tests";
  }

  return "generale";
}

function planifierDemande(question, projetCourant) {
  const demande = question.trim();

  if (!demande) {
    return {
      succes: false,
      erreur: "La demande est vide."
    };
  }

  const plan = {
    succes: true,
    demande,
    projet: projetCourant,
    type: classerDemande(demande),
    lectureSeule: true,
    etapes: []
  };

  const texte = demande.toLowerCase();
  const fichiers = detecterFichiers(demande);
  const termeRecherche = extraireTermeRecherche(demande);

  ajouterEtape(
    plan,
    "analyse",
    "Comprendre le type et la structure générale du projet."
  );

  if (
    plan.type === "correction" ||
    plan.type === "amelioration"
  ) {
    ajouterEtape(
      plan,
      "doctor",
      "Repérer les avertissements et problèmes de qualité."
    );

    ajouterEtape(
      plan,
      "fix",
      "Vérifier la syntaxe, les tests et l’état Git."
    );
  }

  if (plan.type === "creation") {
    ajouterEtape(
      plan,
      "arbre",
      "Trouver le meilleur emplacement pour la nouvelle fonctionnalité.",
      {
        profondeur: 3
      }
    );

    ajouterEtape(
      plan,
      "recherche",
      "Chercher une fonctionnalité similaire déjà présente.",
      {
        terme: termeRecherche || demande
      }
    );
  }

  if (plan.type === "explication") {
    ajouterEtape(
      plan,
      "stats",
      "Mesurer la taille et la composition du projet."
    );
  }

  if (plan.type === "tests") {
    ajouterEtape(
      plan,
      "tests",
      "Exécuter les tests configurés dans le projet."
    );
  }

  if (
    texte.includes("todo") ||
    texte.includes("fixme") ||
    texte.includes("hack") ||
    texte.includes("tâche") ||
    texte.includes("tache")
  ) {
    ajouterEtape(
      plan,
      "todo",
      "Repérer les tâches et problèmes laissés dans les commentaires."
    );
  }

  if (
    texte.includes("structure") ||
    texte.includes("architecture") ||
    texte.includes("organisation")
  ) {
    ajouterEtape(
      plan,
      "arbre",
      "Visualiser l’organisation des fichiers.",
      {
        profondeur: 4
      }
    );
  }

  if (
    texte.includes("git") ||
    texte.includes("commit") ||
    texte.includes("branche")
  ) {
    ajouterEtape(
      plan,
      "git-status",
      "Vérifier l’état du dépôt Git."
    );
  }

  for (const fichier of fichiers) {
    ajouterEtape(
      plan,
      "lire",
      `Lire le fichier mentionné : ${fichier}.`,
      {
        fichier: path.normalize(fichier)
      }
    );
  }

  if (termeRecherche) {
    ajouterEtape(
      plan,
      "recherche",
      `Trouver les occurrences de ${termeRecherche}.`,
      {
        terme: termeRecherche
      }
    );
  }

  if (plan.etapes.length === 1) {
    ajouterEtape(
      plan,
      "doctor",
      "Compléter l’analyse avec l’état général du projet."
    );
  }

  return plan;
}

module.exports = {
  planifierDemande,
  OUTILS_AUTORISES
};
