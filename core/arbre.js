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

function genererArbre(dossier, options = {}) {
  const profondeurMax = options.profondeurMax ?? 5;
  const lignes = [];

  if (!fs.existsSync(dossier)) {
    return {
      succes: false,
      erreur: "Le dossier n’existe pas."
    };
  }

  if (!fs.statSync(dossier).isDirectory()) {
    return {
      succes: false,
      erreur: "Le chemin indiqué n’est pas un dossier."
    };
  }

  function trierElements(elements) {
    return elements.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) {
        return -1;
      }

      if (!a.isDirectory() && b.isDirectory()) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });
  }

  function parcourir(dossierActuel, prefixe, profondeur) {
    if (profondeur > profondeurMax) {
      lignes.push(`${prefixe}└── …`);
      return;
    }

    let elements;

    try {
      elements = fs.readdirSync(dossierActuel, {
        withFileTypes: true
      });
    } catch (erreur) {
      lignes.push(`${prefixe}└── [Impossible à lire]`);
      return;
    }

    elements = elements.filter(element => {
      if (element.isDirectory()) {
        return !DOSSIERS_IGNORES.has(element.name);
      }

      return true;
    });

    trierElements(elements);

    elements.forEach((element, index) => {
      const dernier = index === elements.length - 1;
      const branche = dernier ? "└── " : "├── ";
      const symbole = element.isDirectory() ? "📁 " : "📄 ";

      lignes.push(
        `${prefixe}${branche}${symbole}${element.name}`
      );

      if (element.isDirectory()) {
        const nouveauPrefixe =
          prefixe + (dernier ? "    " : "│   ");

        parcourir(
          path.join(dossierActuel, element.name),
          nouveauPrefixe,
          profondeur + 1
        );
      }
    });
  }

  lignes.push(`📁 ${path.basename(dossier)}`);
  parcourir(dossier, "", 1);

  return {
    succes: true,
    dossier,
    lignes
  };
}

module.exports = {
  genererArbre
};
