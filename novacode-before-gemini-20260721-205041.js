#!/usr/bin/env node

const readline = require("readline");
const path = require("path");

const {
  chargerCommandes
} = require("./core/registry");

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  historySize: 100
});

const contexte = {
  version: "2.0.0",
  projetCourant: process.cwd(),
  historique: [],
  registre: null,
  afficherTitre
};

function afficherTitre() {
  console.log(`
╔══════════════════════════════╗
║          NOVACODE v2         ║
║   Assistant de programmation ║
╚══════════════════════════════╝
`);

  console.log(`Projet : ${contexte.projetCourant}`);
  console.log('Tape "aide" pour voir les commandes.\n');
}

function afficherInvite() {
  rl.question("NovaCode > ", traiterEntree);
}

async function traiterEntree(entree) {
  const texte = entree.trim();

  if (!texte) {
    afficherInvite();
    return;
  }

  if (
    texte === "quitter" ||
    texte === "exit" ||
    texte === "quit"
  ) {
    quitter();
    return;
  }

  if (/^!\d+$/.test(texte)) {
    const numero = Number.parseInt(texte.slice(1), 10);
    const ancienneCommande =
      contexte.historique[numero - 1];

    if (!ancienneCommande) {
      console.log("\nNuméro d’historique invalide.\n");
      afficherInvite();
      return;
    }

    console.log(`\n↻ ${ancienneCommande}`);
    await executerTexte(ancienneCommande, false);
    afficherInvite();
    return;
  }

  await executerTexte(texte, true);
  afficherInvite();
}

async function executerTexte(texte, enregistrer) {
  const parties = decouperCommande(texte);

  if (parties.length === 0) {
    return;
  }

  const nom = parties[0].toLowerCase();
  const args = parties.slice(1);

  if (enregistrer && nom !== "historique") {
    contexte.historique.push(texte);
  }

  const commande = contexte.registre.get(nom);

  if (!commande) {
    console.log(`\nCommande inconnue : ${nom}`);
    console.log('Tape "aide" pour voir les commandes.\n');
    return;
  }

  try {
    await commande.executer(contexte, args);
  } catch (erreur) {
    console.log("\nUne erreur est survenue :");
    console.log(erreur.message);
  }

  console.log("");
}

function quitter() {
  console.log("\nÀ bientôt dans NovaCode!");
  rl.close();
}

rl.on("SIGINT", quitter);

try {
  contexte.registre = chargerCommandes(
    path.join(__dirname, "commands")
  );

  console.clear();
  afficherTitre();
  afficherInvite();
} catch (erreur) {
  console.error("Impossible de démarrer NovaCode :");
  console.error(erreur.message);
  process.exitCode = 1;
}
