const fs = require("fs");
const path = require("path");

const ignores = new Set([
  "node_modules",
  ".git",
  ".snapshots",
  "dist",
  "build",
  ".venv",
  "venv"
]);

const extensions = new Set([
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

module.exports = {
  nom: "todo",
  aliases: ["todos"],
  description: "Liste les TODO, FIXME et HACK",

  executer(contexte, args) {
    const filtre = (args[0] || "").toUpperCase();
    const typesValides = ["TODO", "FIXME", "HACK"];

    if (filtre && !typesValides.includes(filtre)) {
      console.log("\nUtilisation : todo [TODO|FIXME|HACK]");
      return;
    }

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
          if (!ignores.has(element.name)) {
            parcourir(chemin);
          }

          continue;
        }

        if (!element.isFile()) {
          continue;
        }

        const extension = path.extname(element.name).toLowerCase();

        if (extension && !extensions.has(extension)) {
          continue;
        }

        let lignes;

        try {
          lignes = fs.readFileSync(chemin, "utf8").split("\n");
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

          const type = correspondance[1].toUpperCase();

          if (filtre && filtre !== type) {
            return;
          }

          resultats.push({
            type,
            fichier: path.relative(
              contexte.projetCourant,
              chemin
            ),
            ligne: index + 1,
            contenu: ligne.trim()
          });
        });
      }
    }

    parcourir(contexte.projetCourant);

    if (resultats.length === 0) {
      console.log("\nAucun TODO, FIXME ou HACK trouvé.");
      return;
    }

    console.log(
      `\n${resultats.length} note(s) trouvée(s) :\n`
    );

    for (const resultat of resultats) {
      console.log(
        `${resultat.type.padEnd(5)} ` +
        `${resultat.fichier}:${resultat.ligne} │ ` +
        `${resultat.contenu}`
      );
    }
  }
};
