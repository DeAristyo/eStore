const express = require('express');
const routers = express.Router();
const controller = require('../controller/estoreController');

routers.get('/allVouchers', controller.eVoucherList);
routers.get('/paymentMethod', controller.paymentMethod);
routers.post('/checkVoucher', controller.checkVoucher);
routers.post('/userVoucher', controller.userVoucher);
routers.post('/buyVoucher', controller.buyVoucher);
routers.post('/checkout', controller.payTransaction);

module.exports = routers;