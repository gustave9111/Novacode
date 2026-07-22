const fs = require("fs");
const path = require("path");
const os = require("os");

const dossier = path.join(os.homedir(), ".novacode");
const fichier = path.join(dossier, "ai.json");

const configDefaut = {
  provider: "gemini",
  gemini: {
    baseUrl:
      "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-flash"
  }
};

function copierConfigDefaut() {
  return JSON.parse(JSON.stringify(configDefaut));
}

function chargerConfigIA() {
  fs.mkdirSync(dossier, { recursive: true });

  if (!fs.existsSync(fichier)) {
    const config = copierConfigDefaut();
    sauvegarderConfigIA(config);
    return config;
  }

  try {
    const config = JSON.parse(
      fs.readFileSync(fichier, "utf8")
    );

    return {
      ...configDefaut,
      ...config,
      gemini: {
        ...configDefaut.gemini,
        ...(config.gemini || {})
      }
    };
  } catch (erreur) {
    console.warn(
      "Configuration IA invalide. " +
      "La configuration Gemini par défaut sera utilisée."
    );

    const config = copierConfigDefaut();
    sauvegarderConfigIA(config);

    return config;
  }
}

function sauvegarderConfigIA(config) {
  fs.mkdirSync(dossier, { recursive: true });

  fs.writeFileSync(
    fichier,
    JSON.stringify(config, null, 2) + "\n",
    {
      mode: 0o600
    }
  );
}

module.exports = {
  chargerConfigIA,
  sauvegarderConfigIA,
  fichier
};
