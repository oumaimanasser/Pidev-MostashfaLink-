var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth"); // Importer les routes d'authentification

var app = express();

// Connexion à MongoDB directement (sans utiliser dotenv)
mongoose
    .connect("mongodb://127.0.0.1:27017/mydatabase") // Connexion directe à MongoDB
    .then(() => console.log("✅ MongoDB connecté"))
    .catch((err) => {
        console.error("❌ Erreur MongoDB :", err);
        process.exit(1); // Arrêter le serveur si la connexion échoue
    });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade"); // Assure-toi d'avoir le moteur de vue 'jade' installé, ou remplace-le par un autre moteur

// Configuration des middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Définition des routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", authRouter); // Ajouter la route API pour l'authentification

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
    res.render("error");
});

// Définir le port à 3000 ou celui défini dans l'environnement
const port = process.env.PORT || 3000;

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
