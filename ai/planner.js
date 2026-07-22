const path = require("path");

function extraireTermeRecherche(question) {
  const expressions = [
    /où (?:est|sont) utilisée?s? (.+?)[?.!]*$/i,
    /où (?:est|sont) défini(?:e|s)? (.+?)[?.!]*$/i,
    /cherche\s+["']?(.+?)["']?[?.!]*$/i,
    /recherche\s+["']?(.+?)["']?[?.!]*$/i,
    /trouve\s+["']?(.+?)["']?[?.!]*$/i
  ];

  for (const expression of expressions) {
    const correspondance = question.match(expression);

    if (correspondance) {
      return correspondance[1].trim();
    }
  }

  return null;
}

function detecterFichier(question) {
  const correspondance = question.match(
    /(?:^|\s)([\w./-]+\.[a-zA-Z0-9]+)(?:\s|$|\?|,)/i
  );

  return correspondance
    ? correspondance[1]
    : null;
}

function planifierOutils(question) {
  const texte = question.toLowerCase();
  const outils = new Set();

  const demandeGenerale =
    texte.includes("explique le projet") ||
    texte.includes("analyse le projet") ||
    texte.includes("améliorer le projet") ||
    texte.includes("ameliorer le projet") ||
    texte.includes("coder ensuite") ||
    texte.includes("prochaine étape") ||
    texte.includes("prochaine etape") ||
    texte.includes("roadmap") ||
    texte.includes("revue") ||
    texte.includes("review");

  if (demandeGenerale) {
    outils.add("analyse");
    outils.add("stats");
    outils.add("doctor");
    outils.add("todo");
    outils.add("arbre");
  }

  if (
    texte.includes("doctor") ||
    texte.includes("score") ||
    texte.includes("santé") ||
    texte.includes("sante") ||
    texte.includes("problème") ||
    texte.includes("probleme")
  ) {
    outils.add("doctor");
  }

  if (
    texte.includes("stat") ||
    texte.includes("combien de fichier") ||
    texte.includes("combien de ligne") ||
    texte.includes("taille du projet") ||
    texte.includes("plus gros fichier")
  ) {
    outils.add("stats");
  }

  if (
    texte.includes("todo") ||
    texte.includes("fixme") ||
    texte.includes("hack") ||
    texte.includes("tâche") ||
    texte.includes("tache")
  ) {
    outils.add("todo");
  }

  if (
    texte.includes("structure") ||
    texte.includes("arbre") ||
    texte.includes("organisation") ||
    texte.includes("architecture")
  ) {
    outils.add("arbre");
  }

  if (
    texte.includes("type de projet") ||
    texte.includes("technologie") ||
    texte.includes("langage")
  ) {
    outils.add("analyse");
  }

  const termeRecherche = extraireTermeRecherche(question);

  if (termeRecherche) {
    outils.add("recherche");
  }

  const fichier = detecterFichier(question);

  if (outils.size === 0 && !fichier) {
    outils.add("analyse");
    outils.add("doctor");
  }

  return {
    outils: [...outils],
    termeRecherche,
    fichier
  };
}

module.exports = {
  planifierOutils
};
