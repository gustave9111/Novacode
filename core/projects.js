const fs = require("fs");
const path = require("path");
const os = require("os");

const dossier = path.join(os.homedir(), ".novacode");
const fichier = path.join(dossier, "projects.json");

function chargerProjets() {
  fs.mkdirSync(dossier, { recursive: true });

  if (!fs.existsSync(fichier)) {
    return [];
  }

  try {
    const projets = JSON.parse(fs.readFileSync(fichier, "utf8"));
    return Array.isArray(projets) ? projets : [];
  } catch {
    return [];
  }
}

function sauvegarderProjets(projets) {
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(fichier, JSON.stringify(projets, null, 2) + "\n");
}

function memoriserProjet(chemin) {
  const projets = chargerProjets()
    .filter(projet => projet.chemin !== chemin);

  projets.unshift({
    nom: path.basename(chemin),
    chemin,
    derniereOuverture: new Date().toISOString()
  });

  sauvegarderProjets(projets.slice(0, 20));
}

module.exports = {
  chargerProjets,
  memoriserProjet
};
