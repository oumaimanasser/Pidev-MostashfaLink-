import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import logging
import torch
import os

app = Flask(__name__)
CORS(app)

# Configuration du logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configuration pour les téléchargements Hugging Face (utile en Chine)
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'  # Alternative si problèmes de connexion

# Détection du device
device = 0 if torch.cuda.is_available() else -1
logger.info(f"Utilisation du {'GPU' if device == 0 else 'CPU'}")

# Chargement du modèle avec gestion robuste des erreurs
try:
    pipe = pipeline(
        "text-classification",
        model="tabularisai/multilingual-sentiment-analysis",
        device=device,
        top_k=1  # Remplace return_all_scores=False (plus moderne)
    )
    logger.info("Modèle chargé avec succès")
except Exception as e:
    logger.error(f"Erreur critique lors du chargement du modèle: {str(e)}")
    # En production, vous voudrez peut-être quitter ici
    raise

@app.route('/api/analyse-sentiment', methods=['POST'])
def analyse_sentiment():
    try:
        # Gestion plus robuste des données d'entrée
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        data = request.get_json()
        review = data.get('text', '').strip()

        logger.debug(f"Texte reçu: {review}")

        if not review:
            return jsonify({"error": "No text provided"}), 400

        # Ajout d'une vérification de longueur
        if len(review) > 1000:
            return jsonify({"error": "Text too long (max 1000 characters)"}), 400

        # Analyse du sentiment
        result = pipe(review, truncation=True, max_length=512)
        logger.debug(f"Résultat brut du modèle: {result}")

        # Correction ici : accède à l'élément interne de la liste
        response = {
            "sentiment": result[0][0]['label'],  # Accessing the first item inside the list
            "confidence": float(result[0][0]['score']),
            "text": review
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Erreur lors de l'analyse: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
