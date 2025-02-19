var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan'); // Assurez-vous que morgan est bien importé
const mongoose = require("mongoose");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var personnelrouter = require('./routes/personnelRoutes');
require("dotenv").config();

//const registerRoute = require("./routes/register");
//const verifyRoute = require("./routes/verify");
var app = express();

// Définir le port, généralement 3000

// Connexion à MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/registra")
  .then(() => console.log("Connexion à MongoDB réussie."))
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev')); // Utilisation de morgan ici pour la gestion des logs
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/register', personnelrouter);
//app.use("/auth", registerRoute);
//app.use("/auth", verifyRoute);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var port = process.env.PORT || 3001; // Change le port de 3000 à 3001


// Démarre le serveur sur le port défini
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
