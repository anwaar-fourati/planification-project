const errorHandler = (err, req, res, next) => {
  // Parfois, une erreur peut arriver sans code de statut.
  // Si le code est 200 (OK), on le change en 500 (Erreur Serveur).
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  // On renvoie une réponse au format JSON
  res.json({
    message: err.message,
    // On n'envoie la "stack trace" que si on est en mode développement
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};