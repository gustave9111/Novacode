const fs = require("fs");
const path = require("path");
const { analyserSanteProjet } = require("../core/doctor");

function creerSiAbsent(chemin, contenu) {
  if (fs.existsSync(chemin)) return false;
  fs.writeFileSync(chemin, contenu);
  return true;
}

function corriger(dossier) {
  const corrections = [];

  if (creerSiAbsent(
    path.join(dossier, "README.md"),
    `# ${path.basename(dossier)}\n\nProjet documenté avec NovaCode.\n`
  )) {
    corrections.push("README.md créé");
  }

  if (creerSiAbsent(
    path.join(dossier, ".gitignore"),
    "node_modules/\ndist/\nbuild/\n.env\n.snapshots/\n"
  )) {
    corrections.push(".gitignore créé");
  }

  if (creerSiAbsent(
    path.join(dossier, "LICENSE"),
    `Copyright (c) ${new Date().getFullYear()}\n\nAll rights reserved.\n`
  )) {
    corrections.push("LICENSE créée");
  }

  return corrections;
}

module.exports = {
  nom: "doctor",
  aliases: ["docteur", "diagnostic"],
  description: "Analyse le projet; doctor --fix corrige les fichiers manquants",

  executer(contexte, args) {
    if (args.includes("--fix")) {
      const corrections = corriger(contexte.projetCourant);

      if (corrections.length === 0) {
        console.log("\nAucune correction automatique nécessaire.");
      } else {
        console.log("\nCorrections appliquées :");
        corrections.forEach(item => console.log(`  ✓ ${item}`));
      }
    }

    const resultat = analyserSanteProjet(contexte.projetCourant);

    if (!resultat.succes) {
      console.log(`\nErreur : ${resultat.erreur}`);
      return;
    }

    console.log("\n🩺 NovaCode Doctor");
    console.log("─".repeat(55));

    resultat.verifications.forEach(item => console.log(`✓ ${item}`));
    resultat.avertissements.forEach(item => console.log(`⚠ ${item}`));

    console.log("\nCode analysé :");
    console.log(`  Fichiers texte : ${resultat.statistiques.fichiersAnalyses}`);
    console.log(`  TODO : ${resultat.statistiques.todos}`);
    console.log(`  FIXME : ${resultat.statistiques.fixmes}`);
    console.log(`  HACK : ${resultat.statistiques.hacks}`);
    console.log(`  Fichiers vides : ${resultat.statistiques.fichiersVides.length}`);
    console.log(`  Fichiers > 500 lignes : ${resultat.statistiques.fichiersLongs.length}`);
    console.log(`\nScore : ${resultat.score}/100`);
  }
};
