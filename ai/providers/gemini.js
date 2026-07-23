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

  return `Gemini a retourné le statut ${statut}.`;
}

function attendre(delaiMs) {
  return new Promise(resolve => {
    setTimeout(resolve, delaiMs);
  });
}

function estErreurTemporaire(erreur) {
  if (erreur?.temporaire === true) {
    return true;
  }

  const message = String(
    erreur?.message || erreur
  ).toLowerCase();

  return (
    message.includes("high demand") ||
    message.includes("service unavailable") ||
    message.includes("temporarily unavailable") ||
    message.includes("resource exhausted") ||
    message.includes("too many requests") ||
    message.includes("timeout") ||
    message.includes("délai") ||
    message.includes("429") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504")
  );
}

async function demanderGeminiUneFois(
  config,
  prompt
) {
  const cle = process.env.GEMINI_API_KEY;

  if (!cle) {
    throw new Error(
      "GEMINI_API_KEY n’est pas définie. " +
      "Utilise : export GEMINI_API_KEY=\"ta_cle\""
    );
  }

  if (!config?.baseUrl) {
    throw new Error(
      "L’adresse de l’API Gemini est absente de la configuration."
    );
  }

  if (!config?.model) {
    throw new Error(
      "Le modèle Gemini est absent de la configuration."
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
    if (
      erreur.name === "TimeoutError" ||
      erreur.name === "AbortError"
    ) {
      const erreurTimeout = new Error(
        "Gemini n’a pas répondu avant " +
        "l’expiration du délai."
      );

      erreurTimeout.temporaire = true;
      throw erreurTimeout;
    }

    const erreurConnexion = new Error(
      "Impossible de joindre Gemini. " +
      `Détail : ${erreur.message}`
    );

    erreurConnexion.temporaire = true;
    throw erreurConnexion;
  }

  const donnees =
    await reponse.json().catch(() => ({}));

  if (!reponse.ok) {
    const erreurApi = new Error(
      extraireErreur(
        donnees,
        reponse.status
      )
    );

    erreurApi.statut = reponse.status;
    erreurApi.temporaire = (
      reponse.status === 429 ||
      reponse.status >= 500
    );

    throw erreurApi;
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

async function demanderGemini(
  config,
  prompt
) {
  const nombreTentatives = 3;
  let derniereErreur;

  for (
    let tentative = 1;
    tentative <= nombreTentatives;
    tentative++
  ) {
    try {
      return await demanderGeminiUneFois(
        config,
        prompt
      );
    } catch (erreur) {
      derniereErreur = erreur;

      const peutReessayer =
        estErreurTemporaire(erreur) &&
        tentative < nombreTentatives;

      if (!peutReessayer) {
        throw erreur;
      }

      const delaiBase =
        1500 * (2 ** (tentative - 1));

      const variation =
        Math.floor(Math.random() * 500);

      const delai =
        delaiBase + variation;

      console.log(
        "\nGemini est temporairement occupé."
      );

      console.log(
        `Nouvelle tentative ${tentative + 1}/` +
        `${nombreTentatives} dans ` +
        `${(delai / 1000).toFixed(1)} seconde(s)...`
      );

      await attendre(delai);
    }
  }

  throw derniereErreur;
}

async function testerGemini(config) {
  const cle = process.env.GEMINI_API_KEY;

  if (
    !cle ||
    !config?.baseUrl ||
    !config?.model
  ) {
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
