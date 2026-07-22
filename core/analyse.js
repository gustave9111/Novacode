const fs = require("fs");
const path = require("path");

function analyserProjet(dossier) {
  if (!fs.existsSync(dossier)) {
    return {
      succes: false,
      erreur: "Ce dossier n’existe pas."
    };
  }

  if (!fs.statSync(dossier).isDirectory()) {
    return {
      succes: false,
      erreur: "Le chemin indiqué n’est pas un dossier."
    };
  }

  try {
    const fichiers = fs.readdirSync(dossier);
    const types = [];
    const informations = [];

    if (fichiers.includes("package.json")) {
      types.push("JavaScript ou Node.js");
    }

    if (fichiers.includes("index.html")) {
      types.push("Site web HTML");
    }

    if (
      fichiers.includes("requirements.txt") ||
      fichiers.some(fichier => fichier.endsWith(".py"))
    ) {
      types.push("Python");
    }

    if (fichiers.includes("Cargo.toml")) {
      types.push("Rust");
    }

    if (
      fichiers.includes("Makefile") ||
      fichiers.includes("CMakeLists.txt")
    ) {
      types.push("C ou C++");
    }

    if (
      fichiers.some(fichier => fichier.endsWith(".csproj")) ||
      fichiers.some(fichier => fichier.endsWith(".sln"))
    ) {
      types.push("C# ou .NET");
    }

    if (fichiers.includes(".git")) {
      informations.push("Dépôt Git détecté");
    }

    if (fichiers.includes("Dockerfile")) {
      informations.push("Configuration Docker détectée");
    }

    if (
      fichiers.includes("node_modules") ||
      fichiers.includes(".venv") ||
      fichiers.includes("venv")
    ) {
      informations.push("Dépendances locales détectées");
    }

    return {
      succes: true,
      dossier,
      nom: path.basename(dossier),
      types,
      informations,
      nombreElements: fichiers.length
    };
  } catch (erreur) {
    return {
      succes: false,
      erreur: erreur.message
    };
  }
}

module.exports = {
  analyserProjet
};
