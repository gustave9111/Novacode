const fs = require("fs");
const path = require("path");

const DOSSIERS_IGNORES = new Set([
  "node_modules",
  ".git",
  ".snapshots",
  "dist",
  "build"
]);

function obtenirDate() {
  const maintenant = new Date();

  const annee = maintenant.getFullYear();
  const mois = String(maintenant.getMonth() + 1).padStart(2, "0");
  const jour = String(maintenant.getDate()).padStart(2, "0");
  const heure = String(maintenant.getHours()).padStart(2, "0");
  const minute = String(maintenant.getMinutes()).padStart(2, "0");
  const seconde = String(maintenant.getSeconds()).padStart(2, "0");

  return `${annee}-${mois}-${jour}_${heure}-${minute}-${seconde}`;
}

function copierDossier(source, destination) {
  fs.mkdirSync(destination, {
    recursive: true
  });

  const elements = fs.readdirSync(source, {
    withFileTypes: true
  });

  for (const element of elements) {
    if (
      element.isDirectory() &&
      DOSSIERS_IGNORES.has(element.name)
    ) {
      continue;
    }

    const cheminSource = path.join(source, element.name);
    const cheminDestination = path.join(
      destination,
      element.name
    );

    if (element.isDirectory()) {
      copierDossier(cheminSource, cheminDestination);
    } else if (element.isFile()) {
      fs.copyFileSync(
        cheminSource,
        cheminDestination
      );
    }
  }
}

function creerSnapshot(dossierProjet) {
  if (!fs.existsSync(dossierProjet)) {
    return {
      succes: false,
      erreur: "Le projet n’existe pas."
    };
  }

  const dossierSnapshots = path.join(
    dossierProjet,
    ".snapshots"
  );

  const nomSnapshot = obtenirDate();

  const destination = path.join(
    dossierSnapshots,
    nomSnapshot
  );

  try {
    copierDossier(dossierProjet, destination);

    return {
      succes: true,
      nom: nomSnapshot,
      chemin: destination
    };
  } catch (erreur) {
    return {
      succes: false,
      erreur: erreur.message
    };
  }
}

function listerSnapshots(dossierProjet) {
  const dossierSnapshots = path.join(
    dossierProjet,
    ".snapshots"
  );

  if (!fs.existsSync(dossierSnapshots)) {
    return {
      succes: true,
      snapshots: []
    };
  }

  try {
    const snapshots = fs
      .readdirSync(dossierSnapshots, {
        withFileTypes: true
      })
      .filter(element => element.isDirectory())
      .map(element => element.name)
      .sort()
      .reverse();

    return {
      succes: true,
      snapshots
    };
  } catch (erreur) {
    return {
      succes: false,
      erreur: erreur.message
    };
  }
}

module.exports = {
  creerSnapshot,
  listerSnapshots
};
