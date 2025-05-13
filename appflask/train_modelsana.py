import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
from datetime import datetime

# 📥 Charger le dataset
df = pd.read_csv('equipment_data_100.csv')

# 🔄 Calculer les jours entre dates
df['last_maintenance_date'] = pd.to_datetime(df['last_maintenance_date'])
df['next_maintenance_date'] = pd.to_datetime(df['next_maintenance_date'])

df['JoursDepuisDernierEntretien'] = (datetime.now() - df['last_maintenance_date']).dt.days
df['ProchaineEntretienDans'] = (df['next_maintenance_date'] - datetime.now()).dt.days

# 🎯 Variables d'entrée et de sortie
X = df[['JoursDepuisDernierEntretien', 'hours_used']]  # Tu peux ajouter plus de colonnes si besoin
y = df['ProchaineEntretienDans']

# 🤖 Entraîner le modèle
model = LinearRegression()
model.fit(X, y)

# 💾 Sauvegarder le modèle
joblib.dump(model, 'model_entretien.pkl')
print("✅ Modèle entraîné et sauvegardé avec succès.")
