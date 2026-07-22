module.exports = {
  nom: "projet",
  aliases: ["pwd"],
  description: "Affiche le projet courant",

  executer(contexte) {
    console.log(`\nProjet courant : ${contexte.projetCourant}`);
  }
};
