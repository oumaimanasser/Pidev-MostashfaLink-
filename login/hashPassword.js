const bcrypt = require('bcryptjs');

const motDePasse = "motdepasse123"; // Le mot de passe que l'utilisateur a entré

// Générer un "salt" pour le hachage
bcrypt.genSalt(10, function (err, salt) {
    if (err) throw err; // Gérer les erreurs

    // Hacher le mot de passe avec le salt généré
    bcrypt.hash(motDePasse, salt, function (err, hash) {
        if (err) throw err; // Gérer les erreurs

        console.log("Mot de passe haché : ", hash);
        // Ici, `hash` est le mot de passe haché que tu vas enregistrer dans la base de données
    });
});
