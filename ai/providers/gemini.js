function extraireTexte(donnees) {
  const textes = [];

  for (const candidat of donnees.candidates || []) {
    for (
      const partie of
      candidat.content?.parts || []
    ) {
      if (typeof partie.text === "string") {
        textes.push(partie.text);
      }
    }
  }

  return textes.join("\n").trim();
}

function extraireErreur(donnees, statut) {
  if (
    donnees.error &&
    typeof donnees.error.message === "string"
  ) {
    return donnees.error.message;
  }

  return (
    `Gemini a retourné le statut ${statut}.`
  );
}

async function demanderGemini(config, prompt) {
  const cle = process.env.GEMINI_API_KEY;

  if (!cle) {
    throw new Error(
      "GEMINI_API_KEY n’est pas définie. " +
      "Utilise : export GEMINI_API_KEY=\"ta_cle\""
    );
  }

  const baseUrl =
    config.baseUrl.replace(/\/$/, "");

  const modele =
    encodeURIComponent(config.model);

  const url =
    `${baseUrl}/models/${modele}:generateContent`;

  let reponse;

  try {
    reponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": cle
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096
        }
      }),
      signal: AbortSignal.timeout(120000)
    });
  } catch (erreur) {
    if (erreur.name === "TimeoutError") {
      throw new Error(
        "Gemini n’a pas répondu avant " +
        "l’expiration du délai."
      );
    }

    throw new Error(
      "Impossible de joindre Gemini. " +
      `Détail : ${erreur.message}`
    );
  }

  const donnees =
    await reponse.json().catch(() => ({}));

  if (!reponse.ok) {
    throw new Error(
      extraireErreur(
        donnees,
        reponse.status
      )
    );
  }

  const texte = extraireTexte(donnees);

  if (!texte) {
    const raison =
      donnees.candidates?.[0]?.finishReason;

    if (raison) {
      throw new Error(
        "Gemini n’a retourné aucun texte. " +
        `Raison : ${raison}`
      );
    }

    throw new Error(
      "Gemini n’a retourné aucun texte."
    );
  }

  return texte;
}

async function testerGemini(config) {
  const cle = process.env.GEMINI_API_KEY;

  if (!cle) {
    return false;
  }

  const baseUrl =
    config.baseUrl.replace(/\/$/, "");

  const modele =
    encodeURIComponent(config.model);

  const url =
    `${baseUrl}/models/${modele}`;

  try {
    const reponse = await fetch(url, {
      headers: {
        "x-goog-api-key": cle
      },
      signal: AbortSignal.timeout(10000)
    });

    return reponse.ok;
  } catch {
    return false;
  }
}

module.exports = {
  demanderGemini,
  testerGemini
};
