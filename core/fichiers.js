const os = require("os");
const fs = require("fs");
const path = require("path");

function cheminComplet(cheminUtilisateur) {
  if (!cheminUtilisateur || !cheminUtilisateur.trim()) {
    return process.cwd();
  }

  let chemin = cheminUtilisateur.trim();

  if (chemin === "~") {
    chemin = os.homedir();
  } else if (chemin.startsWith("~/")) {
    chemin = path.join(os.homedir(), chemin.slice(2));
  }

  return path.resolve(chemin);
}

function verifierDossier(dossier) {
  if (!fs.existsSync(dossier)) {
    return {
      valide: false,
      erreur: "Ce dossier n’existe pas."
    };
  }

  if (!fs.statSync(dossier).isDirectory()) {
    return {
      valide: false,
      erreur: "Le chemin indiqué n’est pas un dossier."
    };
  }

  return {
    valide: true
  };
}

function verifierFichier(fichier) {
  if (!fs.existsSync(fichier)) {
    return {
      valide: false,
      erreur: "Ce fichier n’existe pas."
    };
  }

  if (!fs.statSync(fichier).isFile()) {
    return {
      valide: false,
      erreur: "Le chemin indiqué n’est pas un fichier."
    };
  }

  return {
    valide: true
  };
}

function listerFichiers(dossier) {
  const verification = verifierDossier(dossier);

  if (!verification.valide) {
    return {
      succes: false,
      erreur: verification.erreur
    };
  }

  try {
    const elements = fs.readdirSync(dossier, {
      withFileTypes: true
    });

    const fichiers = elements.map(element => ({
      nom: element.name,
      chemin: path.join(dossier, element.name),
      type: element.isDirectory() ? "dossier" : "fichier"
    }));

    return {
      succes: true,
      fichiers
    };
  } catch (erreur) {
    return {
      succes: false,
      erreur: erreur.message
    };
  }
}

function lireFichier(fichier) {
  const verification = verifierFichier(fichier);

  if (!verification.valide) {
    return {
      succes: false,
      erreur: verification.erreur
    };
  }

  try {
    const contenu = fs.readFileSync(fichier, "utf8");
    const lignes = contenu.split("\n");

    return {
      succes: true,
      chemin: fichier,
      contenu,
      lignes,
      nombreLignes: lignes.length
    };
  } catch (erreur) {
    return {
      succes: false,
      erreur: erreur.message
    };
  }
}

module.exports = {
  cheminComplet,
  verifierDossier,
  verifierFichier,
  listerFichiers,
  lireFichier
};
