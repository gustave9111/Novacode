#!/usr/bin/env node

const readline = require("readline");

const {
  cheminComplet,
  listerFichiers,
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
  console.log("5. Rechercher dans un projet")
  console.log("6. Afficher l’arbre du projet");
  console.log("7. Afficher les statistiques");
  console.log("0. Quitter");

  rl.question("\nChoisis une option : ", gererChoix);
}

function gererChoix(choix) {
  switch (choix.trim()) {
    case "1":
      demanderAnalyseProjet();
      break;

    case "2":
      demanderListeFichiers();
      break;

    case "3":
      demanderExplicationErreur();
      break;

    case "4":
      demanderLectureFichier();
      break;

    case "5":
      demanderRecherche();
      break;
    case "6":
      demanderArbre();
      break;
    
    case "7":
      demanderStats();
      break;
    
    case "0":
      quitter();
      break;

    default:
      console.log("\nOption invalide.");
      attendreRetour();
  }
}

function demanderAnalyseProjet() {
  rl.question(
    "\nChemin du projet, ou Entrée pour le dossier actuel : ",
    reponse => {
      const dossier = cheminComplet(reponse);
      const resultat = analyserProjet(dossier);

      if (!resultat.succes) {
        console.log(`\nErreur : ${resultat.erreur}`);
        attendreRetour();
        return;
      }

      console.log(`\nProjet : ${resultat.nom}`);
      console.log(`Chemin : ${resultat.dossier}`);
      console.log(`Éléments : ${resultat.nombreElements}`);

      if (resultat.types.length > 0) {
        console.log("\nTypes détectés :");

        for (const type of resultat.types) {
          console.log(`✓ ${type}`);
        }
      } else {
        console.log("\n• Type de projet non reconnu");
      }

      if (resultat.informations.length > 0) {
        console.log("\nInformations supplémentaires :");

        for (const information of resultat.informations) {
          console.log(`✓ ${information}`);
        }
      }

      attendreRetour();
    }
  );
}

function demanderListeFichiers() {
  rl.question(
    "\nChemin du dossier, ou Entrée pour le dossier actuel : ",
    reponse => {
      const dossier = cheminComplet(reponse);
      const resultat = listerFichiers(dossier);

      if (!resultat.succes) {
        console.log(`\nErreur : ${resultat.erreur}`);
        attendreRetour();
        return;
      }

      console.log(`\nContenu de ${dossier} :\n`);

      for (const element of resultat.fichiers) {
        const symbole = element.type === "dossier" ? "📁" : "📄";
        console.log(`${symbole} ${element.nom}`);
      }

      attendreRetour();
    }
  );
}

function demanderLectureFichier() {
  rl.question("\nChemin du fichier à lire : ", reponse => {
    if (!reponse.trim()) {
      console.log("\nTu dois entrer un chemin.");
      attendreRetour();
      return;
    }

    const fichier = cheminComplet(reponse);
    const resultat = lireFichier(fichier);

    if (!resultat.succes) {
      console.log(`\nErreur : ${resultat.erreur}`);
      attendreRetour();
      return;
    }

    console.log(`\nFichier : ${resultat.chemin}`);
    console.log(`Nombre de lignes : ${resultat.nombreLignes}\n`);
    console.log("─".repeat(70));

    resultat.lignes.forEach((ligne, index) => {
      const numero = String(index + 1).padStart(4, " ");
      console.log(`${numero} │ ${ligne}`);
    });

    console.log("─".repeat(70));

    attendreRetour();
  });
}

function demanderExplicationErreur() {
  rl.question("\nColle ton message d’erreur : ", reponse => {
    const resultat = expliquerErreur(reponse);

    console.log(`\n${resultat.titre}`);
    console.log("─".repeat(resultat.titre.length));
    console.log(`\nExplication : ${resultat.explication}`);
    console.log(`\nSolution possible : ${resultat.solution}`);

    attendreRetour();
  });
}
function demanderRecherche() {
  rl.question(
    "\nChemin du projet, ou Entrée pour le dossier actuel : ",
    reponseDossier => {
      const dossier = cheminComplet(reponseDossier);

      rl.question("\nTexte à rechercher : ", terme => {
        const resultat = rechercherDansProjet(dossier, terme);

        if (!resultat.succes) {
          console.log(`\nErreur : ${resultat.erreur}`);
          attendreRetour();
          return;
        }

        console.log(
          `\nRecherche de "${resultat.terme}" dans ${resultat.dossier}`
        );

        if (resultat.nombreResultats === 0) {
          console.log("\nAucun résultat trouvé.");
          attendreRetour();
          return;
        }

        console.log(
          `\n${resultat.nombreResultats} résultat(s) trouvé(s) :\n`
        );

        let ancienFichier = null;

        for (const element of resultat.resultats) {
          if (element.fichier !== ancienFichier) {
            console.log(`\n📄 ${element.fichier}`);
            ancienFichier = element.fichier;
          }

          const contenu = element.contenu || "(ligne vide)";
          console.log(`   Ligne ${element.ligne} │ ${contenu}`);
        }

        if (resultat.erreurs.length > 0) {
          console.log(
            `\nAttention : ${resultat.erreurs.length} fichier(s) ou dossier(s) n’ont pas pu être lus.`
          );
        }

        attendreRetour();
      });
    }
  );
}
function demanderArbre() {
  rl.question(
    "\nChemin du projet, ou Entrée pour le dossier actuel : ",
    reponse => {
      const dossier = cheminComplet(reponse);

      rl.question(
        "\nProfondeur maximale, ou Entrée pour 5 : ",
        profondeurReponse => {
          const profondeur = profondeurReponse.trim()
            ? Number.parseInt(profondeurReponse.trim(), 10)
            : 5;

          if (
            !Number.isInteger(profondeur) ||
            profondeur < 1 ||
            profondeur > 20
          ) {
            console.log(
              "\nLa profondeur doit être un nombre entre 1 et 20."
            );

            attendreRetour();
            return;
          }

          const resultat = genererArbre(dossier, {
            profondeurMax: profondeur
          });

          if (!resultat.succes) {
            console.log(`\nErreur : ${resultat.erreur}`);
            attendreRetour();
            return;
          }

          console.log(`\nStructure de ${resultat.dossier} :\n`);

          for (const ligne of resultat.lignes) {
            console.log(ligne);
          }

          attendreRetour();
        }
      );
    }
  );
}
function demanderStats() {
  rl.question(
    "\nChemin du projet, ou Entrée pour le dossier actuel : ",
    reponse => {
      const dossier = cheminComplet(reponse);

      try {
        const resultat = analyserStats(dossier);

        console.log(`\nStatistiques de ${dossier}\n`);
        console.log(`📁 Dossiers : ${resultat.dossiers}`);
        console.log(`📄 Fichiers : ${resultat.fichiers}`);
        console.log(`🧾 Lignes : ${resultat.lignes}`);
        console.log(
          `💾 Taille : ${formaterTaille(resultat.taille)}`
        );

        console.log("\nExtensions :");

        const extensionsTriees = Object.entries(
          resultat.extensions
        ).sort((a, b) => b[1] - a[1]);

        for (const [extension, nombre] of extensionsTriees) {
          console.log(`  ${extension} : ${nombre}`);
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

      attendreRetour();
    }
  );
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
function quitter() {
  console.log("\nÀ bientôt!");
  rl.close();
}

function attendreRetour() {
  rl.question("\nAppuie sur Entrée pour revenir au menu...", () => {
    afficherTitre();
    afficherMenu();
  });
}

afficherTitre();
afficherMenu();
