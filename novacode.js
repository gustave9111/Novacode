#!/usr/bin/env node
const {
  executerCommandeTerminal
} = require("./core/terminal");

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
  historiqueShell: [],
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

  if (texte.startsWith("!")) {
  const commandeTerminal = texte.slice(1).trim();

  await executerShell(commandeTerminal);
  afficherInvite();
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

async function executerShell(commandeTerminal) {
  if (!commandeTerminal) {
    console.log("\nUtilisation : !<commande>");
    console.log("Exemple : !git status\n");
    return;
  }

  console.log(
    `\n$ ${commandeTerminal}`
  );
  console.log("─".repeat(60));

  const resultat =
    await executerCommandeTerminal(
      commandeTerminal,
      contexte.projetCourant
    );

  contexte.historiqueShell.push({
    commande: commandeTerminal,
    dossier: contexte.projetCourant,
    date: new Date().toISOString(),
    code: resultat.code,
    stdout: resultat.stdout,
    stderr: resultat.stderr
  });

  if (
    resultat.stderr &&
    !resultat.stdout
  ) {
    console.log(`\n${resultat.stderr}`);
  }

  if (resultat.code !== null) {
    console.log(
      `\n[Code de sortie : ${resultat.code}]`
    );
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
