from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
# Création de l'application Flask
app = Flask(__name__)

CORS(app)
# Charger le modèle, l'encodeur, le scaler et les colonnes d'entraînement
model = joblib.load('model_saturation.pkl')
label_encoder = joblib.load('encoder_saturation.pkl')
scaler = joblib.load('scaler.pkl')
columns = joblib.load('columns.pkl')  # 🟢 Colonnes originales après get_dummies

@app.route('/')
def home():
    return "API de prédiction des hôpitaux (Saturation) - Fonctionne bien!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Récupérer les données de la requête
        data = request.get_json()
        print("Données reçues:", data)

        if not all(k in data for k in ["Total_Beds", "Available_Beds", "Hospital"]):
            return jsonify({"error": "Données manquantes pour la prédiction"}), 400

        # Convertir les données en DataFrame
        df = pd.DataFrame(data, index=[0])

        # Encodage one-hot de "Hospital"
        df = pd.get_dummies(df, columns=['Hospital'], drop_first=False)

        # Ajouter les colonnes manquantes et s'assurer de l'ordre
        for col in columns:
            if col not in df.columns:
                df[col] = 0
        df = df[columns]

        # Appliquer le scaler
        df[['Total_Beds', 'Available_Beds']] = scaler.transform(df[['Total_Beds', 'Available_Beds']])
        print("Features après transformation:", df)

        # Prédiction
        prediction = model.predict(df)
        result = label_encoder.inverse_transform(prediction)[0]

        return jsonify({"prediction": result})

    except Exception as e:
        print("Erreur :", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
