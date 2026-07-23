const { spawn } = require("child_process");

const COMMANDES_AUTORISEES = new Set([
  "git",
  "npm",
  "npx",
  "node",
  "python",
  "python3",
  "ls",
  "pwd",
  "cat",
  "grep",
  "find",
  "echo"
]);

function decouperArguments(texte) {
  const argumentsCommande = [];
  const expression = /"([^"]*)"|'([^']*)'|(\S+)/g;

  let resultat;

  while ((resultat = expression.exec(texte)) !== null) {
    argumentsCommande.push(
      resultat[1] ??
      resultat[2] ??
      resultat[3]
    );
  }

  return argumentsCommande;
}

function contientOperateurShell(texte) {
  return /[;&|><`$]/.test(texte);
}

function executerCommandeTerminal(
  texteCommande,
  dossierTravail
) {
  return new Promise(resolve => {
    const texte = texteCommande.trim();

    if (!texte) {
      resolve({
        succes: false,
        code: null,
        stdout: "",
        stderr: "Commande vide."
      });

      return;
    }

    /*
     * On n'utilise pas shell: true.
     * Les opérateurs comme ;, |, > ou && sont refusés.
     */
    if (contientOperateurShell(texte)) {
      resolve({
        succes: false,
        code: null,
        stdout: "",
        stderr:
          "Les opérateurs shell comme ;, |, >, < et && ne sont pas autorisés."
      });

      return;
    }

    const parties = decouperArguments(texte);
    const programme = parties[0];
    const args = parties.slice(1);

    if (!COMMANDES_AUTORISEES.has(programme)) {
      resolve({
        succes: false,
        code: null,
        stdout: "",
        stderr:
          `Commande non autorisée : ${programme}\n` +
          `Commandes permises : ${
            [...COMMANDES_AUTORISEES].join(", ")
          }`
      });

      return;
    }

    const processus = spawn(programme, args, {
      cwd: dossierTravail,
      shell: false,
      env: process.env
    });

    let stdout = "";
    let stderr = "";

    processus.stdout.on("data", donnees => {
      const texteSortie = donnees.toString();
      stdout += texteSortie;
      process.stdout.write(texteSortie);
    });

    processus.stderr.on("data", donnees => {
      const texteErreur = donnees.toString();
      stderr += texteErreur;
      process.stderr.write(texteErreur);
    });

    processus.on("error", erreur => {
      resolve({
        succes: false,
        code: null,
        stdout,
        stderr: erreur.message
      });
    });

    processus.on("close", code => {
      resolve({
        succes: code === 0,
        code,
        stdout,
        stderr
      });
    });
  });
}

module.exports = {
  executerCommandeTerminal,
  COMMANDES_AUTORISEES
};
