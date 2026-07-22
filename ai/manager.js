const {
  demanderGemini,
  testerGemini
} = require("./providers/gemini");

async function demanderIA(config, prompt) {
  if (config.provider === "gemini") {
    return demanderGemini(
      config.gemini,
      prompt
    );
  }

  throw new Error(
    `Fournisseur IA inconnu : ${
      config.provider
    }`
  );
}

async function obtenirStatut(config) {
  if (config.provider === "gemini") {
    return {
      provider: "gemini",
      model: config.gemini.model,
      clePresente: Boolean(
        process.env.GEMINI_API_KEY
      ),
      connecte: await testerGemini(
        config.gemini
      )
    };
  }

  return {
    provider: config.provider,
    model: "inconnu",
    clePresente: false,
    connecte: false
  };
}

module.exports = {
  demanderIA,
  obtenirStatut
};
