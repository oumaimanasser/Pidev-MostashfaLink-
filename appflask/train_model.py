from flask import Flask, request, jsonify
import joblib
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import LabelEncoder

# Création de l'application Flask
app = Flask(__name__)

# Charger le modèle, l'encodeur et le scaler
model = joblib.load('model_saturation.pkl')  # Charger le modèle
label_encoder = joblib.load('encoder_saturation.pkl')  # Charger l'encodeur de la cible
scaler = joblib.load('scaler.pkl')  # Charger le scaler

# Route d'accueil pour vérifier si le serveur fonctionne
@app.route('/')
def home():
    return "API de prédiction des hôpitaux (Saturation) - Fonctionne bien!"
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Données reçues:", data)

        if not all(k in data for k in ["Total_Beds", "Available_Beds", "Hospital"]):
            return jsonify({"error": "Données manquantes pour la prédiction"}), 400

        # Créer le DataFrame à partir des données reçues
        features = pd.DataFrame([data])

        # Encodage one-hot de la colonne 'Hospital'
        features = pd.get_dummies(features, columns=['Hospital'], drop_first=True)

        # Normalisationcd
        features[['Total_Beds', 'Available_Beds']] = scaler.transform(
            features[['Total_Beds', 'Available_Beds']]
        )

        # Vérification : colonnes finales doivent correspondre à celles de l'entraînement
        for col in model.feature_names_in_:
            if col not in features.columns:
                features[col] = 0  # Ajouter la colonne manquante avec 0

        features = features[model.feature_names_in_]  # Réordonner les colonnes

        prediction = model.predict(features)
        prediction_label = label_encoder.inverse_transform(prediction)[0]

        return jsonify({"prediction": prediction_label})

    except Exception as e:
        print("Erreur :", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
