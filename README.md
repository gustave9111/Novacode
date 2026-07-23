/tmp/21318B51-31EA-432A-A6A9-5AE951BAAB1B.jpeg
# 🚀 NovaCode
        /tmp/3A8ACED8-80A7-4866-BE44-5CA6814186CD.jpeg
> **Un assistant de programmation intelligent pour le terminal.**

NovaCode est un assistant CLI conçu pour aider les développeurs à comprendre, analyser et améliorer leurs projets de manière sécurisée. Il combine des outils d'analyse locale avec l'intelligence artificielle pour proposer des modifications sans jamais les appliquer automatiquement.

---

## ✨ Fonctionnalités

* 📂 Analyse de projet
* 🩺 Doctor (diagnostic de qualité du projet)
* 🛠️ Corrections automatiques (`doctor --fix`)
* 📊 Statistiques du projet
* 🔍 Recherche dans le code
* 📖 Lecture de fichiers
* 📸 Snapshots avant modification
* 🤖 Intégration IA (Gemini)
* 💬 Agent conversationnel (`ask`)
* 📝 Détection des `TODO`, `FIXME` et `HACK`
* 💻 Terminal intégré
* 🧠 Propositions de modifications sécurisées (`propose`)
* 👀 Prévisualisation avant application (`pending`)
* ✅ Application contrôlée des changements (`apply`)
* 📜 Historique Shell
* 📁 Gestion des projets récents

---

# 🔒 Sécurité

NovaCode est conçu pour garder l'utilisateur maître des changements.

Chaque modification suit le processus suivant :

```
IA
 ↓
Proposition
 ↓
Validation
 ↓
Prévisualisation
 ↓
Snapshot
 ↓
Application
```

Aucun fichier n'est modifié sans validation.

---

# 🚀 Installation

```bash
git clone https://github.com/gustave9111/Novacode.git
cd Novacode
npm install
```

---

# 🔑 Configuration de Gemini

Créer une clé API Gemini puis définir la variable d'environnement :

```bash
export GEMINI_API_KEY="votre_cle"
```

Pour la rendre permanente :

```bash
echo 'export GEMINI_API_KEY="votre_cle"' >> ~/.bashrc
source ~/.bashrc
```

---

# 📖 Commandes principales

| Commande        | Description                                |
| --------------- | ------------------------------------------ |
| `ouvrir`        | Ouvre un projet                            |
| `analyse`       | Analyse le projet                          |
| `doctor`        | Vérifie la qualité du projet               |
| `doctor --fix`  | Corrige certains problèmes automatiquement |
| `stats`         | Affiche les statistiques                   |
| `todo`          | Liste les TODO / FIXME / HACK              |
| `lire`          | Lit un fichier                             |
| `recherche`     | Recherche dans le projet                   |
| `snapshot`      | Crée un snapshot                           |
| `snapshots`     | Liste les snapshots                        |
| `ask`           | Pose une question à l'IA                   |
| `fix`           | Lance un diagnostic complet                |
| `propose`       | Prépare une modification                   |
| `pending`       | Affiche la proposition                     |
| `apply`         | Applique la proposition                    |
| `shell-history` | Historique des commandes                   |

---

# 🏗️ Architecture

```
NovaCode
│
├── commands/
├── core/
├── ai/
│   └── providers/
├── .snapshots/
└── package.json
```

---

# 🗺️ Feuille de route

## Version actuelle

* ✅ Analyse de projet
* ✅ Doctor
* ✅ Snapshots
* ✅ Terminal intégré
* ✅ Intégration Gemini
* ✅ Propositions sécurisées
* ✅ Historique Shell

## Prochaines versions

* ⏳ Planner intelligent
* ⏳ Tool Engine
* ⏳ Mémoire de projet
* ⏳ Commande `continue`
* ⏳ Commande `why`
* ⏳ Tests automatisés complets
* ⏳ Intégration d'autres fournisseurs IA

---

# 🤝 Contribution

Les contributions sont les bienvenues.

1. Fork du dépôt
2. Créer une branche
3. Développer
4. Tester
5. Ouvrir une Pull Request

---

# 📄 Licence

Ce projet est distribué sous la licence MIT.

---

# ⭐ Soutenir le projet

Si NovaCode t'est utile :

* ⭐ Ajoute une étoile au dépôt GitHub
* 🐛 Signale les bugs
* 💡 Propose de nouvelles idées
* 🤝 Contribue au projet

---

**NovaCode** a pour objectif de rendre le développement plus simple, plus sûr et plus transparent grâce à une combinaison d'outils locaux et d'intelligence artificielle.
