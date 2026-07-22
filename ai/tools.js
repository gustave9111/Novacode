const fs = require("fs");
const path = require("path");

const { analyserProjet } = require("../core/analyse");
const { analyserStats } = require("../core/stats");
const { analyserSanteProjet } = require("../core/doctor");
const { genererArbre } = require("../core/arbre");
const { rechercherDansProjet } = require("../core/recherche");

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
  ".ts",
  ".tsx",
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

function executerAnalyse(projetCourant) {
  const resultat = analyserProjet(projetCourant);

  if (!resultat.succes) {
    return {
      outil: "analyse",
      succes: false,
      erreur: resultat.erreur
    };
  }

  return {
    outil: "analyse",
    succes: true,
    nom: resultat.nom,
    types: resultat.types,
    informations: resultat.informations,
    nombreElements: resultat.nombreElements
  };
}

function executerStats(projetCourant) {
  try {
    const resultat = analyserStats(projetCourant);

    return {
      outil: "stats",
      succes: true,
      dossiers: resultat.dossiers,
      fichiers: resultat.fichiers,
      lignes: resultat.lignes,
      tailleOctets: resultat.taille,
      extensions: resultat.extensions,
      plusGrosFichier: resultat.plusGrosFichier
    };
  } catch (erreur) {
    return {
      outil: "stats",
      succes: false,
      erreur: erreur.message
    };
  }
}

function executerDoctor(projetCourant) {
  const resultat = analyserSanteProjet(projetCourant);

  if (!resultat.succes) {
    return {
      outil: "doctor",
      succes: false,
      erreur: resultat.erreur
    };
  }

  return {
    outil: "doctor",
    succes: true,
    score: resultat.score,
    verifications: resultat.verifications,
    avertissements: resultat.avertissements,
    statistiques: resultat.statistiques
  };
}

function executerArbre(projetCourant, profondeur = 3) {
  const resultat = genererArbre(projetCourant, {
    profondeurMax: profondeur
  });

  if (!resultat.succes) {
    return {
      outil: "arbre",
      succes: false,
      erreur: resultat.erreur
    };
  }

  return {
    outil: "arbre",
    succes: true,
    lignes: resultat.lignes.slice(0, 250)
  };
}

function executerRecherche(projetCourant, terme) {
  const resultat = rechercherDansProjet(
    projetCourant,
    terme
  );

  if (!resultat.succes) {
    return {
      outil: "recherche",
      succes: false,
      terme,
      erreur: resultat.erreur
    };
  }

  return {
    outil: "recherche",
    succes: true,
    terme,
    nombreResultats: resultat.nombreResultats,
    resultats: resultat.resultats
      .slice(0, 80)
      .map(element => ({
        fichier: path.relative(
          projetCourant,
          element.fichier
        ),
        ligne: element.ligne,
        contenu: element.contenu
      }))
  };
}

function executerTodo(projetCourant) {
  const resultats = [];

  function parcourir(dossier) {
    let elements;

    try {
      elements = fs.readdirSync(dossier, {
        withFileTypes: true
      });
    } catch {
      return;
    }

    for (const element of elements) {
      const chemin = path.join(dossier, element.name);

      if (element.isDirectory()) {
        if (!DOSSIERS_IGNORES.has(element.name)) {
          parcourir(chemin);
        }

        continue;
      }

      if (!element.isFile()) {
        continue;
      }

      const extension = path.extname(
        element.name
      ).toLowerCase();

      if (extension && !EXTENSIONS_TEXTE.has(extension)) {
        continue;
      }

      let lignes;

      try {
        lignes = fs.readFileSync(
          chemin,
          "utf8"
        ).split("\n");
      } catch {
        continue;
      }

      lignes.forEach((ligne, index) => {
        const correspondance = ligne.match(
          /(?:\/\/|#|\/\*|\*)\s*(TODO|FIXME|HACK)\b[:\s-]*(.*)/i
        );

        if (!correspondance) {
          return;
        }

        resultats.push({
          type: correspondance[1].toUpperCase(),
          fichier: path.relative(
            projetCourant,
            chemin
          ),
          ligne: index + 1,
          contenu: ligne.trim()
        });
      });
    }
  }

  parcourir(projetCourant);

  return {
    outil: "todo",
    succes: true,
    nombreResultats: resultats.length,
    resultats: resultats.slice(0, 100)
  };
}

module.exports = {
  executerAnalyse,
  executerStats,
  executerDoctor,
  executerArbre,
  executerRecherche,
  executerTodo
};
