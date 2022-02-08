const JWT = require('jsonwebtoken');
require('dotenv').config();

const jwtSign = (payload, expiresIn) => {
    return JWT.sign(payload, process.env.TOKEN_SECRET, { expiresIn });
};

module.exports = jwtSign;