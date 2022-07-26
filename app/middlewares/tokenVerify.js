const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('token');
    if(!token) return res.status(401).send(statusCode[401]);

    try {
        const user = jwt.verify(token, "42");
        req.user = user._id;
        next();
    } catch(err)  {
        res.status(401).send(statusCode[401]);
    }
}
