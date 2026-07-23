const fs = require("fs");
const path = require("path");

const {
  executerCommandeTerminal
} = require("./terminal");

const {
  analyserSanteProjet
} = require("./doctor");

const DOSSIERS_IGNORES = new Set([
  "node_modules",
  ".git",
  ".snapshots",
  "dist",
  "build",
  ".venv",
  "venv"
]);

function trouverFichiersJavaScript(dossierProjet) {
  const fichiers = [];

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

      if (
        element.isFile() &&
        [".js", ".mjs", ".cjs"].includes(
          path.extname(element.name).toLowerCase()
        )
      ) {
        fichiers.push(chemin);
      }
    }
  }

  parcourir(dossierProjet);

  return fichiers;
}

function lirePackageJson(dossierProjet) {
  const fichier = path.join(dossierProjet, "package.json");

  if (!fs.existsSync(fichier)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(fichier, "utf8"));
  } catch {
    return null;
  }
}

async function verifierSyntaxeJavaScript(dossierProjet) {
  const fichiers = trouverFichiersJavaScript(dossierProjet);
  const resultats = [];

  for (const fichier of fichiers.slice(0, 100)) {
    const relatif = path.relative(dossierProjet, fichier);

    const resultat = await executerCommandeTerminal(
      `node --check "${relatif}"`,
      dossierProjet
    );

    resultats.push({
      fichier: relatif,
      succes: resultat.succes,
      code: resultat.code,
      stderr: resultat.stderr.trim()
    });
  }

  return {
    fichiersVerifies: resultats.length,
    erreurs: resultats.filter(element => !element.succes)
  };
}

async function executerTests(dossierProjet) {
  const packageJson = lirePackageJson(dossierProjet);

  if (!packageJson) {
    return {
      execute: false,
      raison: "package.json absent ou invalide"
    };
  }

  if (!packageJson.scripts?.test) {
    return {
      execute: false,
      raison: "aucun script test dans package.json"
    };
  }

  const resultat = await executerCommandeTerminal(
    "npm test",
    dossierProjet
  );

  return {
    execute: true,
    succes: resultat.succes,
    code: resultat.code,
    stdout: resultat.stdout.slice(-12000),
    stderr: resultat.stderr.slice(-12000)
  };
}

async function verifierGit(dossierProjet) {
  const dossierGit = path.join(dossierProjet, ".git");

  if (!fs.existsSync(dossierGit)) {
    return {
      execute: false,
      raison: "dépôt Git absent"
    };
  }

  const resultat = await executerCommandeTerminal(
    "git status --short",
    dossierProjet
  );

  return {
    execute: true,
    succes: resultat.succes,
    code: resultat.code,
    stdout: resultat.stdout.trim(),
    stderr: resultat.stderr.trim()
  };
}

async function analyserProblemesProjet(dossierProjet) {
  const doctor = analyserSanteProjet(dossierProjet);

  const syntaxe = await verifierSyntaxeJavaScript(
    dossierProjet
  );

  const tests = await executerTests(dossierProjet);
  const git = await verifierGit(dossierProjet);

  return {
    projet: dossierProjet,
    doctor: doctor.succes
      ? {
          score: doctor.score,
          avertissements: doctor.avertissements,
          statistiques: doctor.statistiques
        }
      : {
          erreur: doctor.erreur
        },
    syntaxe,
    tests,
    git
  };
}

module.exports = {
  analyserProblemesProjet
};
