function expliquerErreur(erreurUtilisateur) {
  const texte = erreurUtilisateur.toLowerCase().trim();

  if (!texte) {
    return {
      titre: "Erreur vide",
      explication: "Tu dois entrer un message d’erreur à analyser.",
      solution: "Copie le message affiché dans ton terminal."
    };
  }

  if (texte.includes("command not found")) {
    return {
      titre: "Commande introuvable",
      explication:
        "Le programme demandé n’est probablement pas installé ou n’est pas accessible dans le PATH.",
      solution:
        "Vérifie l’orthographe de la commande, puis cherche si le programme est installé."
    };
  }

  if (texte.includes("permission denied")) {
    return {
      titre: "Permission refusée",
      explication:
        "Ton utilisateur n’a pas la permission nécessaire pour accéder au fichier ou exécuter la commande.",
      solution:
        "Vérifie les permissions avec ls -l. Évite d’utiliser sudo sans comprendre pourquoi."
    };
  }

  if (
    texte.includes("no such file") ||
    texte.includes("aucun fichier ou dossier")
  ) {
    return {
      titre: "Fichier introuvable",
      explication:
        "Le chemin utilisé ne correspond pas à un fichier ou un dossier existant.",
      solution:
        "Vérifie ton dossier actuel avec pwd, puis son contenu avec ls."
    };
  }

  if (
    texte.includes("cannot find module") ||
    texte.includes("module not found")
  ) {
    return {
      titre: "Module absent",
      explication:
        "Une dépendance nécessaire au programme est absente ou son chemin est incorrect.",
      solution:
        "Pour un projet Node.js, vérifie package.json puis exécute npm install."
    };
  }

  if (
    texte.includes("syntaxerror") ||
    texte.includes("syntax error") ||
    texte.includes("unexpected token")
  ) {
    return {
      titre: "Erreur de syntaxe",
      explication:
        "Le langage n’arrive pas à comprendre une partie du code.",
      solution:
        "Regarde le fichier et le numéro de ligne indiqués dans le message d’erreur."
    };
  }

  if (
    texte.includes("address already in use") ||
    texte.includes("eaddrinuse")
  ) {
    return {
      titre: "Port déjà utilisé",
      explication:
        "Un autre programme utilise déjà le port réseau demandé.",
      solution:
        "Ferme l’ancien programme ou utilise un autre port."
    };
  }

  if (texte.includes("enoent")) {
    return {
      titre: "Chemin manquant",
      explication:
        "Node.js essaie d’accéder à un fichier ou dossier qui n’existe pas.",
      solution:
        "Vérifie le chemin concerné et assure-toi que le fichier a été créé."
    };
  }

  if (texte.includes("eacces")) {
    return {
      titre: "Accès interdit",
      explication:
        "Node.js n’a pas les permissions nécessaires pour effectuer cette action.",
      solution:
        "Vérifie le propriétaire et les permissions du fichier ou du dossier."
    };
  }

  return {
    titre: "Erreur non reconnue",
    explication:
      "NovaCode ne possède pas encore une règle précise pour cette erreur.",
    solution:
      "Lis les dernières lignes du message et cherche le nom du fichier, la ligne et le type d’erreur."
  };
}

module.exports = {
  expliquerErreur
};
