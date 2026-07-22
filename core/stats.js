const fs = require("fs");
const path = require("path");

function analyserStats(dossier) {
    const stats = {
        dossiers: 0,
        fichiers: 0,
        lignes: 0,
        taille: 0,
        extensions: {},
        plusGrosFichier: {
            nom: null,
            lignes: 0
        }
    };

    function parcourir(chemin) {
        const elements = fs.readdirSync(chemin, {
            withFileTypes: true
        });

        for (const element of elements) {

            const complet = path.join(chemin, element.name);

            if (element.isDirectory()) {

                if (
                    element.name === "node_modules" ||
                    element.name === ".git" ||
                    element.name === ".snapshots"
                ) {
                    continue;
                }

                stats.dossiers++;
                parcourir(complet);
                continue;
            }

            stats.fichiers++;

            const info = fs.statSync(complet);
            stats.taille += info.size;

            const ext = path.extname(element.name) || "sans extension";

            stats.extensions[ext] ??= 0;
            stats.extensions[ext]++;

            try {

                const texte = fs.readFileSync(complet, "utf8");

                const nbLignes = texte.split("\n").length;

                stats.lignes += nbLignes;

                if (nbLignes > stats.plusGrosFichier.lignes) {

                    stats.plusGrosFichier.nom = complet;
                    stats.plusGrosFichier.lignes = nbLignes;

                }

            } catch {

            }

        }

    }

    parcourir(dossier);

    return stats;
}

module.exports = {
    analyserStats
};
