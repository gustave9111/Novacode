module.exports = {
  nom: "version",
  aliases: ["v"],
  description: "Affiche la version de NovaCode",

  executer(contexte) {
    console.log(`\nNovaCode v${contexte.version}`);
    console.log("Architecture modulaire v2");
  }
};
