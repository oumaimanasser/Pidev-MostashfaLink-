const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Définir le modèle utilisateur
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Hacher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Créer le modèle
const User = mongoose.model("User", userSchema);

module.exports = User;
