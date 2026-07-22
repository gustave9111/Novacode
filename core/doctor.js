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

function analyserSanteProjet(dossierProjet) {
  if (!fs.existsSync(dossierProjet)) {
    return {
      succes: false,
      erreur: "Le projet n’existe pas."
    };
  }

  if (!fs.statSync(dossierProjet).isDirectory()) {
    return {
      succes: false,
      erreur: "Le chemin du projet n’est pas un dossier."
    };
  }

  const resultat = {
    succes: true,
    verifications: [],
    avertissements: [],
    statistiques: {
      todos: 0,
      fixmes: 0,
      hacks: 0,
      fichiersLongs: [],
      fichiersVides: [],
      fichiersAnalyses: 0
    },
    score: 100
  };

  verifierFichiersPrincipaux(dossierProjet, resultat);
  verifierGit(dossierProjet, resultat);
  verifierSnapshots(dossierProjet, resultat);
  parcourirProjet(dossierProjet, resultat);
  calculerScore(resultat);

  return resultat;
}

function verifierFichiersPrincipaux(dossier, resultat) {
  const packageJson = path.join(dossier, "package.json");
  const readmeMajuscule = path.join(dossier, "README.md");
  const readmeMinuscule = path.join(dossier, "readme.md");
  const licence = path.join(dossier, "LICENSE");
  const licenceMd = path.join(dossier, "LICENSE.md");
  const gitignore = path.join(dossier, ".gitignore");

  if (fs.existsSync(packageJson)) {
    resultat.verifications.push("package.json trouvé");

    try {
      const contenu = fs.readFileSync(packageJson, "utf8");
      JSON.parse(contenu);
      resultat.verifications.push("package.json valide");
    } catch {
      resultat.avertissements.push(
        "package.json contient du JSON invalide"
      );
    }
  } else {
    resultat.avertissements.push("package.json absent");
  }

  if (
    fs.existsSync(readmeMajuscule) ||
    fs.existsSync(readmeMinuscule)
  ) {
    resultat.verifications.push("README trouvé");
  } else {
    resultat.avertissements.push("README absent");
  }

  if (
    fs.existsSync(licence) ||
    fs.existsSync(licenceMd)
  ) {
    resultat.verifications.push("Licence trouvée");
  } else {
    resultat.avertissements.push("Licence absente");
  }

  if (fs.existsSync(gitignore)) {
    resultat.verifications.push(".gitignore trouvé");
  } else {
    resultat.avertissements.push(".gitignore absent");
  }
}

function verifierGit(dossier, resultat) {
  const dossierGit = path.join(dossier, ".git");

  if (fs.existsSync(dossierGit)) {
    resultat.verifications.push("Dépôt Git détecté");
  } else {
    resultat.avertissements.push(
      "Projet non initialisé avec Git"
    );
  }
}

function verifierSnapshots(dossier, resultat) {
  const dossierSnapshots = path.join(
    dossier,
    ".snapshots"
  );

  if (!fs.existsSync(dossierSnapshots)) {
    resultat.avertissements.push("Aucun snapshot créé");
    return;
  }

  try {
    const snapshots = fs
      .readdirSync(dossierSnapshots, {
        withFileTypes: true
      })
      .filter(element => element.isDirectory());

    if (snapshots.length === 0) {
      resultat.avertissements.push("Aucun snapshot créé");
    } else {
      resultat.verifications.push(
        `${snapshots.length} snapshot(s) disponible(s)`
      );
    }
  } catch {
    resultat.avertissements.push(
      "Impossible de lire le dossier des snapshots"
    );
  }
}

function parcourirProjet(dossier, resultat) {
  let elements;

  try {
    elements = fs.readdirSync(dossier, {
      withFileTypes: true
    });
  } catch {
    resultat.avertissements.push(
      `Impossible de lire : ${dossier}`
    );
    return;
  }

  for (const element of elements) {
    const chemin = path.join(dossier, element.name);

    if (element.isDirectory()) {
      if (!DOSSIERS_IGNORES.has(element.name)) {
        parcourirProjet(chemin, resultat);
      }

      continue;
    }

    if (!element.isFile()) {
      continue;
    }

    let information;

    try {
      information = fs.statSync(chemin);
    } catch {
      continue;
    }

    if (information.size === 0) {
      resultat.statistiques.fichiersVides.push(chemin);
    }

    const extension = path
      .extname(element.name)
      .toLowerCase();

    if (
      extension &&
      !EXTENSIONS_TEXTE.has(extension)
    ) {
      continue;
    }

    let contenu;

    try {
      contenu = fs.readFileSync(chemin, "utf8");
    } catch {
      continue;
    }

    resultat.statistiques.fichiersAnalyses++;

    const lignes = contenu.split("\n");

    if (lignes.length > 500) {
      resultat.statistiques.fichiersLongs.push({
        chemin,
        lignes: lignes.length
      });
    }

    for (const ligne of lignes) {
      const correspondance = ligne.match(
        /(?:\/\/|#|\/\*|\*)\s*(TODO|FIXME|HACK)\b/i
      );

      if (!correspondance) {
        continue;
      }

      const type = correspondance[1].toUpperCase();

      if (type === "TODO") {
        resultat.statistiques.todos++;
      } else if (type === "FIXME") {
        resultat.statistiques.fixmes++;
      } else if (type === "HACK") {
        resultat.statistiques.hacks++;
      }
    }
  }
}

function calculerScore(resultat) {
  let score = 100;

  for (const avertissement of resultat.avertissements) {
    if (avertissement.includes("package.json")) {
      score -= 15;
    } else if (avertissement.includes("README")) {
      score -= 8;
    } else if (avertissement.includes("Licence")) {
      score -= 5;
    } else if (avertissement.includes(".gitignore")) {
      score -= 5;
    } else if (avertissement.includes("Git")) {
      score -= 10;
    } else if (avertissement.includes("snapshot")) {
      score -= 5;
    } else {
      score -= 3;
    }
  }

  score -= Math.min(
    resultat.statistiques.todos,
    10
  );

  score -= Math.min(
    resultat.statistiques.fixmes * 2,
    10
  );

  score -= Math.min(
    resultat.statistiques.hacks * 2,
    10
  );

  score -= Math.min(
    resultat.statistiques.fichiersLongs.length * 2,
    10
  );

  score -= Math.min(
    resultat.statistiques.fichiersVides.length,
    5
  );

  resultat.score = Math.max(0, score);
}

module.exports = {
  analyserSanteProjet
};
