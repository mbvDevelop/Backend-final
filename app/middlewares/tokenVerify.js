const jwt = require('jsonwebtoken');

// Comprueba el token de acceso y si es valido inserta el id del usuario en req.user
module.exports = function (req, res, next) {
    // Obtiene el token de acceso del header (campo "token")
    const token = req.header('token');
    if (!token) return res.status(401).send("Required access tok");
    try {
        const user = jwt.verify(token, process.env.TOKEN_SALT); // Verificar el token del usuario y obtener el payload
        req.user = user._id; // Extraer el id del usuario del payload
        next();
    } catch (err) {
        res.status(401).send(err);
    }
}
