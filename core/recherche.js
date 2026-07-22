const fs = require("fs");
const path = require("path");

const DOSSIERS_IGNORES = new Set([
  "node_modules",
  ".git",
  ".snapshots",
  "dist",
  "build",
  ".venv",
  "venv"
]);

const EXTENSIONS_TEXTE = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".html",
  ".css",
  ".md",
  ".txt",
  ".py",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".cs",
  ".java",
  ".rs",
  ".sh",
  ".xml",
  ".yaml",
  ".yml"
]);

function estFichierTexte(fichier) {
  const extension = path.extname(fichier).toLowerCase();

  if (!extension) {
    return true;
  }

  return EXTENSIONS_TEXTE.has(extension);
}

function rechercherDansProjet(dossier, terme) {
  if (!fs.existsSync(dossier)) {
    return {
      succes: false,
      erreur: "Le dossier du projet n’existe pas."
    };
  }

  if (!fs.statSync(dossier).isDirectory()) {
    return {
      succes: false,
      erreur: "Le chemin indiqué n’est pas un dossier."
    };
  }

  if (!terme || !terme.trim()) {
    return {
      succes: false,
      erreur: "Tu dois entrer un texte à rechercher."
    };
  }

  const recherche = terme.trim().toLowerCase();
  const resultats = [];
  const erreurs = [];

  function parcourir(dossierActuel) {
    let elements;

    try {
      elements = fs.readdirSync(dossierActuel, {
        withFileTypes: true
      });
    } catch (erreur) {
      erreurs.push({
        chemin: dossierActuel,
        message: erreur.message
      });

      return;
    }

    for (const element of elements) {
      const chemin = path.join(dossierActuel, element.name);

      if (element.isDirectory()) {
        if (!DOSSIERS_IGNORES.has(element.name)) {
          parcourir(chemin);
        }

        continue;
      }

      if (!element.isFile() || !estFichierTexte(chemin)) {
        continue;
      }

      let contenu;

      try {
        contenu = fs.readFileSync(chemin, "utf8");
      } catch (erreur) {
        erreurs.push({
          chemin,
          message: erreur.message
        });

        continue;
      }

      const lignes = contenu.split("\n");

      lignes.forEach((ligne, index) => {
        if (ligne.toLowerCase().includes(recherche)) {
          resultats.push({
            fichier: chemin,
            ligne: index + 1,
            contenu: ligne.trim()
          });
        }
      });
    }
  }

  parcourir(dossier);

  return {
    succes: true,
    terme: terme.trim(),
    dossier,
    resultats,
    nombreResultats: resultats.length,
    erreurs
  };
}

module.exports = {
  rechercherDansProjet
};
