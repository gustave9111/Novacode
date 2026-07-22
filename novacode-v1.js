#!/usr/bin/env node

const readline = require("readline");
const path = require("path");
const fs = require("fs");

const {
  cheminComplet,
  lireFichier
} = require("./core/fichiers");

const {
  analyserProjet
} = require("./core/analyse");

const {
  expliquerErreur
} = require("./core/erreurs");

const {
  rechercherDansProjet
} = require("./core/recherche");

const {
  genererArbre
} = require("./core/arbre");

const {
  analyserStats
} = require("./core/stats");

const {
  creerSnapshot,
  listerSnapshots
} = require("./core/snapshot");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  historySize: 100
});

let projetCourant = process.cwd();

function afficherTitre() {
  console.clear();

  console.log(`
╔══════════════════════════════╗
║          NOVACODE            ║
║   Assistant de programmation ║
╚══════════════════════════════╝
`);

  console.log(`Projet courant : ${projetCourant}`);
  console.log('Tape "aide" pour voir les commandes.\n');
}

function afficherInvite() {
  rl.question("NovaCode > ", traiterCommande);
}

function traiterCommande(entree) {
  const commandeComplete = entree.trim();

  if (!commandeComplete) {
    afficherInvite();
    return;
  }

  const [nomCommande, ...argumentsCommande] =
    decouperCommande(commandeComplete);

  const commande = nomCommande.toLowerCase();
  const argument = argumentsCommande.join(" ");

  switch (commande) {
    case "aide":
    case "help":
      afficherAide();
      break;

    case "ouvrir":
    case "open":
    case "cd":
      ouvrirProjet(argument);
      break;

    case "projet":
    case "pwd":
      afficherProjet();
      break;

    case "analyse":
    case "analyser":
      lancerAnalyse();
      break;

    case "stats":
      afficherStats();
      break;

    case "arbre":
    case "tree":
      afficherArbre(argument);
      break;

    case "recherche":
    case "chercher":
    case "search":
      lancerRecherche(argument);
      break;

    case "lire":
    case "ouvrir-fichier":
    case "cat":
      afficherFichier(argument);
      break;

    case "erreur":
    case "expliquer":
      analyserErreur(argument);
      break;

    case "effacer":
    case "clear":
    case "cls":
      afficherTitre();
      terminerCommande();
      break;

case "snapshot":
case "sauvegarde":
  creerSauvegarde();
  break;

case "snapshots":
case "sauvegardes":
  afficherSnapshots();
  break;

case "version":
  afficherVersion();
  break;

    case "quitter":
    case "exit":
    case "quit":
      quitter();
      break;

    default:
      console.log(`\nCommande inconnue : ${commande}`);
      console.log('Tape "aide" pour voir les commandes.');
      terminerCommande();
  }
}

function decouperCommande(texte) {
  const parties = [];
  const expression = /"([^"]*)"|'([^']*)'|(\S+)/g;

  let resultat;

  while ((resultat = expression.exec(texte)) !== null) {
    parties.push(
      resultat[1] ??
      resultat[2] ??
      resultat[3]
    );
  }

  return parties;
}

function afficherAide() {
  console.log(`
Commandes disponibles
────────────────────────────────────────────────────

aide
  Affiche cette liste.

ouvrir <dossier>
  Charge un projet.
  Exemple : ouvrir ~/novacode

projet
  Affiche le projet courant.

analyse
  Analyse le projet courant.

stats
  Affiche les statistiques du projet.

arbre [profondeur]
  Affiche la structure du projet.
  Exemple : arbre 3

recherche <texte>
  Recherche un texte dans tout le projet.
  Exemple : recherche analyserProjet

lire <fichier>
  Affiche le contenu d’un fichier.
  Exemple : lire core/analyse.js

erreur <message>
  Explique une erreur courante.
  Exemple : erreur "permission denied"

effacer
  Nettoie l’écran.

snapshot
  Crée une sauvegarde du projet courant.

snapshots
  Affiche les sauvegardes disponibles.

version
  Affiche la version de NovaCode.

quitter
  Ferme NovaCode.
`);

  terminerCommande();
}

function ouvrirProjet(argument) {
  if (!argument) {
    console.log("\nUtilisation : ouvrir <chemin>");
    terminerCommande();
    return;
  }

  const dossier = cheminComplet(argument);

  if (!fs.existsSync(dossier)) {
    console.log("\nErreur : ce dossier n’existe pas.");
    terminerCommande();
    return;
  }

  if (!fs.statSync(dossier).isDirectory()) {
    console.log("\nErreur : le chemin indiqué n’est pas un dossier.");
    terminerCommande();
    return;
  }

  projetCourant = dossier;

  console.log("\n✓ Projet chargé");
  console.log(`  ${projetCourant}`);

  terminerCommande();
}

function afficherProjet() {
  console.log(`\nProjet courant : ${projetCourant}`);
  terminerCommande();
}

function lancerAnalyse() {
  const resultat = analyserProjet(projetCourant);

  if (!resultat.succes) {
    console.log(`\nErreur : ${resultat.erreur}`);
    terminerCommande();
    return;
  }

  console.log(`\nProjet : ${resultat.nom}`);
  console.log(`Chemin : ${resultat.dossier}`);
  console.log(`Éléments : ${resultat.nombreElements}`);

  if (resultat.types.length > 0) {
    console.log("\nTypes détectés :");

    for (const type of resultat.types) {
      console.log(`  ✓ ${type}`);
    }
  } else {
    console.log("\nType de projet non reconnu.");
  }

  if (resultat.informations.length > 0) {
    console.log("\nInformations :");

    for (const information of resultat.informations) {
      console.log(`  ✓ ${information}`);
    }
  }

  terminerCommande();
}

function afficherStats() {
  try {
    const resultat = analyserStats(projetCourant);

    console.log(`\nStatistiques de ${projetCourant}`);
    console.log("─".repeat(55));

    console.log(`📁 Dossiers : ${resultat.dossiers}`);
    console.log(`📄 Fichiers : ${resultat.fichiers}`);
    console.log(`🧾 Lignes : ${resultat.lignes}`);
    console.log(`💾 Taille : ${formaterTaille(resultat.taille)}`);

    const extensions = Object.entries(
      resultat.extensions
    ).sort((a, b) => b[1] - a[1]);

    if (extensions.length > 0) {
      console.log("\nExtensions :");

      for (const [extension, nombre] of extensions) {
        console.log(`  ${extension} : ${nombre}`);
      }
    }

    if (resultat.plusGrosFichier.nom) {
      console.log("\nPlus gros fichier texte :");
      console.log(`  ${resultat.plusGrosFichier.nom}`);
      console.log(
        `  ${resultat.plusGrosFichier.lignes} lignes`
      );
    }
  } catch (erreur) {
    console.log(`\nErreur : ${erreur.message}`);
  }

  terminerCommande();
}

function afficherArbre(argument) {
  let profondeur = 5;

  if (argument) {
    profondeur = Number.parseInt(argument, 10);
  }

  if (
    !Number.isInteger(profondeur) ||
    profondeur < 1 ||
    profondeur > 20
  ) {
    console.log(
      "\nLa profondeur doit être un nombre entre 1 et 20."
    );

    terminerCommande();
    return;
  }

  const resultat = genererArbre(projetCourant, {
    profondeurMax: profondeur
  });

  if (!resultat.succes) {
    console.log(`\nErreur : ${resultat.erreur}`);
    terminerCommande();
    return;
  }

  console.log("");

  for (const ligne of resultat.lignes) {
    console.log(ligne);
  }

  terminerCommande();
}

function lancerRecherche(argument) {
  if (!argument) {
    console.log("\nUtilisation : recherche <texte>");
    terminerCommande();
    return;
  }

  const resultat = rechercherDansProjet(
    projetCourant,
    argument
  );

  if (!resultat.succes) {
    console.log(`\nErreur : ${resultat.erreur}`);
    terminerCommande();
    return;
  }

  if (resultat.nombreResultats === 0) {
    console.log(`\nAucun résultat pour "${argument}".`);
    terminerCommande();
    return;
  }

  console.log(
    `\n${resultat.nombreResultats} résultat(s) pour "${argument}" :`
  );

  let ancienFichier = null;

  for (const element of resultat.resultats) {
    const fichierRelatif = path.relative(
      projetCourant,
      element.fichier
    );

    if (fichierRelatif !== ancienFichier) {
      console.log(`\n📄 ${fichierRelatif}`);
      ancienFichier = fichierRelatif;
    }

    const contenu = raccourcirTexte(
      element.contenu || "(ligne vide)",
      120
    );

    console.log(
      `   ${String(element.ligne).padStart(4, " ")} │ ${contenu}`
    );
  }

  terminerCommande();
}

function afficherFichier(argument) {
  if (!argument) {
    console.log("\nUtilisation : lire <fichier>");
    terminerCommande();
    return;
  }

  const fichier = convertirCheminProjet(argument);
  const resultat = lireFichier(fichier);

  if (!resultat.succes) {
    console.log(`\nErreur : ${resultat.erreur}`);
    terminerCommande();
    return;
  }

  console.log(`\nFichier : ${resultat.chemin}`);
  console.log(`Lignes : ${resultat.nombreLignes}\n`);
  console.log("─".repeat(75));

  resultat.lignes.forEach((ligne, index) => {
    const numero = String(index + 1).padStart(4, " ");
    console.log(`${numero} │ ${ligne}`);
  });

  console.log("─".repeat(75));

  terminerCommande();
}

function analyserErreur(argument) {
  if (!argument) {
    console.log('\nUtilisation : erreur "message d’erreur"');
    terminerCommande();
    return;
  }

  const resultat = expliquerErreur(argument);

  console.log(`\n${resultat.titre}`);
  console.log("─".repeat(resultat.titre.length));
  console.log(`\nExplication : ${resultat.explication}`);
  console.log(`\nSolution possible : ${resultat.solution}`);

  terminerCommande();
}

function convertirCheminProjet(cheminUtilisateur) {
  if (
    cheminUtilisateur === "~" ||
    cheminUtilisateur.startsWith("~/") ||
    path.isAbsolute(cheminUtilisateur)
  ) {
    return cheminComplet(cheminUtilisateur);
  }

  return path.resolve(projetCourant, cheminUtilisateur);
}

function formaterTaille(nombreOctets) {
  if (nombreOctets < 1024) {
    return `${nombreOctets} octets`;
  }

  if (nombreOctets < 1024 ** 2) {
    return `${(nombreOctets / 1024).toFixed(1)} Ko`;
  }

  if (nombreOctets < 1024 ** 3) {
    return `${(nombreOctets / 1024 ** 2).toFixed(1)} Mo`;
  }

  return `${(nombreOctets / 1024 ** 3).toFixed(1)} Go`;
}

function raccourcirTexte(texte, longueurMaximale) {
  if (texte.length <= longueurMaximale) {
    return texte;
  }

  return `${texte.slice(0, longueurMaximale - 3)}...`;
}

function terminerCommande() {
  console.log("");
  afficherInvite();
}

function creerSauvegarde() {
  console.log("\nCréation du snapshot...");

  const resultat = creerSnapshot(projetCourant);

  if (!resultat.succes) {
    console.log(`Erreur : ${resultat.erreur}`);
    terminerCommande();
    return;
  }

  console.log("\n✓ Snapshot créé");
  console.log(`  Nom : ${resultat.nom}`);
  console.log(`  Chemin : ${resultat.chemin}`);

  terminerCommande();
}

function afficherSnapshots() {
  const resultat = listerSnapshots(projetCourant);

  if (!resultat.succes) {
    console.log(`\nErreur : ${resultat.erreur}`);
    terminerCommande();
    return;
  }

  if (resultat.snapshots.length === 0) {
    console.log("\nAucun snapshot trouvé.");
    terminerCommande();
    return;
  }

  console.log("\nSnapshots disponibles :\n");

  resultat.snapshots.forEach((snapshot, index) => {
    console.log(`${index + 1}. ${snapshot}`);
  });

  terminerCommande();
}

function afficherVersion() {
  console.log("\nNovaCode v1.0.0");
  console.log("Assistant de programmation en terminal");
  terminerCommande();
}

function quitter() {
  console.log("\nÀ bientôt dans NovaCode!");
  rl.close();
}

rl.on("SIGINT", () => {
  quitter();
});

afficherTitre();
afficherInvite();
