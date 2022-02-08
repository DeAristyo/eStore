const JWT = require('jsonwebtoken');
require('dotenv').config();

const jwtVerify = (token) => {
    const decodedData = JWT.decode(token);
    try {
        const decoded = JWT.verify(token, process.env.TOKEN_SECRET);
        return { payload: decoded, expired: false };
    } catch (error) {
        return { payload: decodedData, expired: 'JWT expired' };
    }
};

module.exports = jwtVerify;