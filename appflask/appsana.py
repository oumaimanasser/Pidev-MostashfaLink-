from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
# Charger le modèle
model = joblib.load('model_entretien.pkl')

@app.route('/predict-entretien', methods=['POST'])
def predict_entretien():
    try:
        data = request.get_json()

        # Extraire les données
        jours = data['JoursDepuisDernierEntretien']
        heures = data['hours_used']

        features = np.array([[jours, heures]])

        prediction = model.predict(features)[0]
        return jsonify({
            'ProchaineEntretienDans': round(prediction, 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
