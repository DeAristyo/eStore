const jwtVerify = require('../Helper/jwtVerify');
const jwtSign = require('../Helper/jwtSign');
const JWT = require('jsonwebtoken');

const tokenChecker = (req, res, next) => {
    const accessToken = req.headers.accesstoken;
    const refreshToken = req.headers.refreshtoken;
    console.log(req.headers);

    if (!accessToken) return res.status(406).send({ error: true, message: 'Error Token', detail: `Can't find accessToken!` });

    const { payload, expired } = jwtVerify(accessToken);

    if (!expired) {
        return next();
    }

    const { expired: refreshExpired } = jwtVerify(refreshToken);

    if (refreshExpired && expired) return res.status(406)({ error: true, message: 'Error Token', detail: 'All token Expired' });

    if (!refreshExpired) {
        const newAccessToken = jwtSign(payload);
        req.dataToken = newAccessToken;
        return next();
    }
};

module.exports = tokenChecker;