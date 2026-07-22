module.exports = {
  nom: "effacer",
  aliases: ["clear", "cls"],
  description: "Nettoie l’écran",

  executer(contexte) {
    console.clear();
    contexte.afficherTitre();
  }
};
