# 🏥 Application de Gestion des Équipements et du Personnel

## 🧾 Objectif

Cette application permet aux établissements de santé de gérer facilement leur personnel 👩‍⚕️ et leurs équipements médicaux 🛠️ à travers une interface moderne :

- 👥 Ajouter, modifier et supprimer les membres du personnel
- 🛠️ Ajouter, afficher et supprimer les équipements
- 📆 Synchroniser la fin de service du personnel avec Google Calendar
- 🤖 (Optionnel) Prédire les pannes ou les maintenances via une IA Python/Flask

## 🛠️ Technologies utilisées

| 🔧 Élément         | 💡 Technologie              |
|--------------------|-----------------------------|
| 🎨 Frontend        | React.js                    |
| 🔙 Backend         | Node.js + Express           |
| 🗄️ Base de données | MongoDB                     |
| 📅 Planning        | Google Calendar API         |
| 🧠 Intelligence     | Python + Flask (Machine Learning) |

## 📁 Structure du projet

- `equipment-crud/` → Backend Node.js pour la gestion des équipements  
- `personnel-crud/` → Backend Node.js pour la gestion du personnel  
- `front/` → Frontend React avec navigation entre modules  
- `README.md` → Documentation du projet
