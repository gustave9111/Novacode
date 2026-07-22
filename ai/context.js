const fs = require("fs");
const path = require("path");

const { analyserProjet } = require("../core/analyse");
const { analyserStats } = require("../core/stats");
const {
  analyserSanteProjet
} = require("../core/doctor");

const extensionsTexte = new Set([
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

function estDansProjet(chemin, projetCourant) {
  const cheminRelatif = path.relative(
    projetCourant,
    chemin
  );

  return (
    cheminRelatif !== ".." &&
    !cheminRelatif.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(cheminRelatif)
  );
}

function trouverFichierMentionne(
  question,
  projetCourant
) {
  const mots = question.match(/[^\s"'`]+/g) || [];

  for (const motBrut of mots) {
    const mot = motBrut.replace(/[?,;:!.)]+$/, "");

    if (!mot) {
      continue;
    }

    const chemin = path.resolve(
      projetCourant,
      mot
    );

    if (!estDansProjet(chemin, projetCourant)) {
      continue;
    }

    if (
      !fs.existsSync(chemin) ||
      !fs.statSync(chemin).isFile()
    ) {
      continue;
    }

    const extension =
      path.extname(chemin).toLowerCase();

    if (
      extension &&
      !extensionsTexte.has(extension)
    ) {
      continue;
    }

    return chemin;
  }

  return null;
}

function lireExtrait(chemin, limite = 12000) {
  const contenu = fs.readFileSync(
    chemin,
    "utf8"
  );

  if (contenu.length <= limite) {
    return contenu;
  }

  return (
    contenu.slice(0, limite) +
    "\n\n[Extrait coupé par NovaCode]"
  );
}

function construireContexte(
  projetCourant,
  question
) {
  const analyse = analyserProjet(
    projetCourant
  );

  const stats = analyserStats(
    projetCourant
  );

  const doctor = analyserSanteProjet(
    projetCourant
  );

  const fichierMentionne =
    trouverFichierMentionne(
      question,
      projetCourant
    );

  const types =
    analyse.succes &&
    Array.isArray(analyse.types) &&
    analyse.types.length
      ? analyse.types.join(", ")
      : "inconnu";

  const statistiquesDoctor =
    doctor.succes &&
    doctor.statistiques
      ? doctor.statistiques
      : {};

  const parties = [
    "Tu es NovaCode, un assistant de programmation.",
    "Réponds en français canadien.",
    "Sois clair, précis et concret.",
    "N’invente jamais le contenu des fichiers.",
    "Ne prétends jamais avoir modifié le projet.",
    "Signale clairement tes incertitudes.",
    "",
    `Projet courant : ${projetCourant}`,
    `Nom : ${path.basename(projetCourant)}`,
    `Types détectés : ${types}`,
    `Dossiers : ${stats.dossiers}`,
    `Fichiers : ${stats.fichiers}`,
    `Lignes : ${stats.lignes}`,
    `Taille : ${stats.taille} octets`,
    `Score Doctor : ${
      doctor.succes
        ? doctor.score
        : "indisponible"
    }`,
    `TODO : ${
      doctor.succes
        ? statistiquesDoctor.todos ?? 0
        : "indisponible"
    }`,
    `FIXME : ${
      doctor.succes
        ? statistiquesDoctor.fixmes ?? 0
        : "indisponible"
    }`,
    `HACK : ${
      doctor.succes
        ? statistiquesDoctor.hacks ?? 0
        : "indisponible"
    }`
  ];

  if (
    doctor.succes &&
    Array.isArray(doctor.avertissements) &&
    doctor.avertissements.length
  ) {
    parties.push(
      `Avertissements Doctor : ${
        doctor.avertissements.join("; ")
      }`
    );
  }

  if (fichierMentionne) {
    parties.push(
      "",
      `Fichier demandé : ${path.relative(
        projetCourant,
        fichierMentionne
      )}`,
      "Contenu du fichier :",
      "```",
      lireExtrait(fichierMentionne),
      "```"
    );
  }

  parties.push(
    "",
    `Question : ${question}`
  );

  return parties.join("\n");
}

module.exports = {
  construireContexte
};
