const fs = require("fs");
const path = require("path");

function chargerCommandes(dossierCommandes) {
  const registre = new Map();

  if (!fs.existsSync(dossierCommandes)) {
    throw new Error(
      `Le dossier de commandes n’existe pas : ${dossierCommandes}`
    );
  }

  const fichiers = fs
    .readdirSync(dossierCommandes)
    .filter(fichier => fichier.endsWith(".js"))
    .sort();

  for (const fichier of fichiers) {
    const chemin = path.join(dossierCommandes, fichier);

    delete require.cache[require.resolve(chemin)];
    const commande = require(chemin);

    if (
      !commande ||
      typeof commande.nom !== "string" ||
      typeof commande.executer !== "function"
    ) {
      console.log(`⚠ Commande invalide ignorée : ${fichier}`);
      continue;
    }

    const noms = [
      commande.nom,
      ...(commande.aliases || [])
    ];

    for (const nom of noms) {
      registre.set(nom.toLowerCase(), commande);
    }
  }

  return registre;
}

module.exports = {
  chargerCommandes
};
