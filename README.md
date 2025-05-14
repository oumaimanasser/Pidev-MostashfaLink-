<h1 align="center">🏥 Application de Gestion des Dossiers Médicaux</h1>

---

## 🧾 Objectif

Cette application assiste les **infirmiers de triage** et les **professionnels de santé** dans la gestion quotidienne des dossiers médicaux :

- 📝 Ajouter, modifier et supprimer les dossiers des patients
- 🤖 Utiliser un **chatbot** pour aider à remplir les fiches rapidement
- 🧠 Classer automatiquement chaque dossier selon le **niveau d'urgence** :  
  **🟥 Élevée**, **🟧 Moyenne**, **🟩 Faible** (via une IA en Python/Flask)

---

## 🛠️ Technologies utilisées

| 🔧 Élément          | 💡 Technologie              |
|---------------------|-----------------------------|
| 🎨 Frontend         | React.js                    |
| 🔙 Backend          | Node.js + Express           |
| 🗄️ Base de données | MongoDB                     |
| 🧠 Intelligence     | Python + Flask (Machine Learning) |
| 🤖 Chatbot          | Intégré dans l’interface React |

---

## 📁 Structure du projet

```bash
projet-dossier-medical/
├── backend/           # API Express : routes, contrôleurs, modèles
├── frontend/          # Interface React : composants, pages, chatbot
├── ia-flask/          # API Flask : prédiction du niveau d'urgence
└── README.md          # Documentation du projet
