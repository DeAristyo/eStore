const QRCode = require('qrcode');

const generateQr = async text => {
    try {
        let image;
        const qr = await QRCode.toDataURL(text);
        console.log(qr);
        return qr;
    } catch (error) {
        console.log(error);
    }
};

module.exports = generateQr;