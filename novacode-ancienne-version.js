#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function afficherTitre() {
  console.clear();

  console.log(`
╔══════════════════════════════╗
║          NOVACODE            ║
║   Assistant de programmation ║
╚══════════════════════════════╝
`);
}

function afficherMenu() {
  console.log("1. Analyser un projet");
  console.log("2. Lister les fichiers");
  console.log("3. Expliquer une erreur");
  console.log("4. Lire un fichier");
  console.log("5. Quitter");

  rl.question("\nChoisis une option : ", gererChoix);
}

function gererChoix(choix) {
  switch (choix.trim()) {
    case "1":
      analyserProjet();
      break;

    case "2":
      demanderDossier(listerFichiers);
      break;

    case "3":
      expliquerErreur();
      break;

    case "4":
      lireFichier();
      break;

    case "5":
      console.log("\nÀ bientôt dans NovaCode!");
      rl.close();
      break;

    default:
      console.log("\nOption invalide.");
      attendreRetour();
  }
}

function demanderDossier(callback) {
  rl.question(
    "\nChemin du projet, ou Entrée pour le dossier actuel : ",
    dossier => {
      const chemin = dossier.trim()
        ? path.resolve(dossier.trim())
        : process.cwd();

      callback(chemin);
    }
  );
}

function analyserProjet() {
  demanderDossier(dossier => {
    if (!fs.existsSync(dossier)) {
      console.log("\nCe dossier n’existe pas.");
      attendreRetour();
      return;
    }

    if (!fs.statSync(dossier).isDirectory()) {
      console.log("\nLe chemin indiqué n’est pas un dossier.");
      attendreRetour();
      return;
    }

    console.log(`\nAnalyse de : ${dossier}\n`);

    const fichiers = fs.readdirSync(dossier);
    let typeDetecte = false;

    if (fichiers.includes("package.json")) {
      console.log("✓ Projet JavaScript ou Node.js détecté");
      typeDetecte = true;
    }

    if (fichiers.includes("index.html")) {
      console.log("✓ Projet web HTML détecté");
      typeDetecte = true;
    }

    if (
      fichiers.includes("requirements.txt") ||
      fichiers.some(fichier => fichier.endsWith(".py"))
    ) {
      console.log("✓ Projet Python détecté");
      typeDetecte = true;
    }

    if (fichiers.includes("Cargo.toml")) {
      console.log("✓ Projet Rust détecté");
      typeDetecte = true;
    }

    if (fichiers.includes("Makefile")) {
      console.log("✓ Projet utilisant Make détecté");
      typeDetecte = true;
    }

    if (fichiers.includes(".git")) {
      console.log("✓ Dépôt Git détecté");
    }

    if (!typeDetecte) {
      console.log("• Type de projet non reconnu");
    }

    console.log(`✓ ${fichiers.length} élément(s) dans le dossier`);

    attendreRetour();
  });
}

function listerFichiers(dossier) {
  if (!fs.existsSync(dossier)) {
    console.log("\nCe dossier n’existe pas.");
    attendreRetour();
    return;
  }

  if (!fs.statSync(dossier).isDirectory()) {
    console.log("\nLe chemin indiqué n’est pas un dossier.");
    attendreRetour();
    return;
  }

  console.log(`\nFichiers de ${dossier} :\n`);

  const fichiers = fs.readdirSync(dossier, {
    withFileTypes: true
  });

  for (const fichier of fichiers) {
    const symbole = fichier.isDirectory() ? "📁" : "📄";
    console.log(`${symbole} ${fichier.name}`);
  }

  attendreRetour();
}

function lireFichier() {
  rl.question(
    "\nChemin du fichier à lire, par exemple ./novacode.js : ",
    fichier => {
      const chemin = path.resolve(fichier.trim());

      if (!fichier.trim()) {
        console.log("\nTu dois entrer un chemin de fichier.");
        attendreRetour();
        return;
      }

      if (!fs.existsSync(chemin)) {
        console.log("\nCe fichier n’existe pas.");
        attendreRetour();
        return;
      }

      if (!fs.statSync(chemin).isFile()) {
        console.log("\nLe chemin indiqué n’est pas un fichier.");
        attendreRetour();
        return;
      }

      try {
        const contenu = fs.readFileSync(chemin, "utf8");
        const lignes = contenu.split("\n");

        console.log(`\nFichier : ${chemin}`);
        console.log(`Nombre de lignes : ${lignes.length}\n`);
        console.log("─".repeat(60));

        lignes.forEach((ligne, index) => {
          const numero = String(index + 1).padStart(4, " ");
          console.log(`${numero} │ ${ligne}`);
        });

        console.log("─".repeat(60));
      } catch (erreur) {
        console.log("\nImpossible de lire ce fichier.");
        console.log(`Détail : ${erreur.message}`);
      }

      attendreRetour();
    }
  );
}

function expliquerErreur() {
  rl.question("\nColle une erreur courte : ", erreur => {
    const texte = erreur.toLowerCase();

    console.log("\nAnalyse NovaCode :\n");

    if (texte.includes("command not found")) {
      console.log(
        "La commande n’est probablement pas installée ou n’est pas dans le PATH."
      );
    } else if (texte.includes("permission denied")) {
      console.log(
        "Le fichier ou la commande n’a pas les permissions nécessaires."
      );
    } else if (
      texte.includes("no such file") ||
      texte.includes("aucun fichier ou dossier")
    ) {
      console.log(
        "Le fichier ou le dossier indiqué n’existe pas à cet emplacement."
      );
    } else if (
      texte.includes("module not found") ||
      texte.includes("cannot find module")
    ) {
      console.log("Une dépendance ou un module nécessaire est absent.");
    } else if (
      texte.includes("syntaxerror") ||
      texte.includes("syntax error")
    ) {
      console.log("Il y a probablement une erreur de syntaxe dans le code.");
    } else if (texte.includes("address already in use")) {
      console.log(
        "Le port demandé est déjà utilisé par un autre programme."
      );
    } else {
      console.log("Erreur non reconnue automatiquement pour le moment.");
      console.log("NovaCode affichera bientôt des analyses plus détaillées.");
    }

    attendreRetour();
  });
}

function attendreRetour() {
  rl.question("\nAppuie sur Entrée pour revenir au menu...", () => {
    afficherTitre();
    afficherMenu();
  });
}

afficherTitre();
afficherMenu();
