const util = require('util');
const { db } = require('../database/database');
const query = util.promisify(db.query).bind(db);
const randomString = require('../helper/RandomString');
const genQr = require('../helper/qrCodeGenerator');
const fs = require('fs');
const handlebar = require('handlebars');
const { resolve } = require('path');
const { rejects } = require('assert');


module.exports = {
    eVoucherList: async (req, res) => {
        const getQuery = 'SELECT * FROM vouchers';

        try {
            const getData = await query(getQuery)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            res.status(200).send({
                error: false,
                message: 'This is the available voucher list',
                vouchers: getData
            });
        } catch (error) {
            if (error.status) {
                res.status(error.status).send({
                    error: true,
                    message: error.message
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: error.message
                });
            }
        }
    },

    paymentMethod: async (req, res) => {
        const getQuery = 'SELECT * FROM payment_method';

        try {
            const getData = await query(getQuery)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            res.status(200).send({
                error: false,
                message: 'This is the available payment methods',
                vouchers: getData
            });
        } catch (error) {
            if (error.status) {
                res.status(error.status).send({
                    error: true,
                    message: error.message
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: error.message
                });
            }
        }
    },

    userVoucher: async (req, res) => {
        const data = req.body;

        let getUserQuery = 'SELECT * FROM user WHERE phone = ?';
        let userQuery = 'SELECT * FROM user_voucher WHERE user_id  =  ?';

        try {
            const getUser = await query(getUserQuery, data.phone)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            const getUserVoucher = await query(userQuery, getUser[0].id)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            res.status(200).send({
                error: false,
                message: 'User Voucher History',
                data: getUserVoucher
            });
        } catch (error) {
            if (error.status) {
                res.status(error.status).send({
                    error: true,
                    message: error.message
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: error.message
                });
            }
        }
    },

    checkVoucher: async (req, res) => {
        const data = req.body;

        let getVoucher = 'SELECT * FROM user_voucher WHERE voucher_code = ?';

        try {
            const qrImage = await genQr(data.voucherCode);
            const verifyVoucher = await query(getVoucher, data.voucherCode)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            if (verifyVoucher[0].status === 'Unused') {
                fs.readFile('../estore/view/unusedQr.html', { encoding: 'utf-8' }, (err, file) => {
                    if (err) throw err;

                    const unused = handlebar.compile(file);
                    const qrHTML = unused({ qrimage: qrImage, voucherCode: data.voucherCode });

                    res.send(qrHTML);
                });
            } else if (verifyVoucher[0].status === 'Used') {
                res.status(200).send({
                    error: false,
                    message: `Voucher's already been used`,
                    data: {
                        status: verifyVoucher[0].status,
                        Transaction_date: verifyVoucher[0].created_at
                    }
                });
            }
        } catch (error) {
            if (error.status) {
                res.status(error.status).send({
                    error: true,
                    message: error.message
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: error.message
                });
            }
        }
    },

    buyVoucher: async (req, res) => {
        const data = req.body;

        let getUserQuery = 'SELECT * FROM user WHERE phone = ?';
        let getPaymentMethodQuery = 'SELECT * FROM payment_method where payment_provider = ?';
        let getVoucherQuery = 'SELECT * FROM vouchers WHERE amount = ?';
        let insertQuery = "INSERT INTO user_voucher SET ?";
        let timeQuery = 'UPDATE user_voucher SET expiry_date = CURRENT_TIMESTAMP() + interval 12 month WHERE id = ?';

        try {
            await query('Start Transaction');
            const user = await query(getUserQuery, data.userPhone)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });
            console.log(user);

            const paymentMethod = await query(getPaymentMethodQuery, data.payment_methods)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            const voucher = await query(getVoucherQuery, data.voucherAmount)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });


            const total = (voucher[0].price * data.qty) - (voucher[0].price * paymentMethod[0].discount);

            let result;

            for (let i = 0; i < data.qty; i++) {
                const code = randomString();

                let dataToset = {
                    user_id: user[0].id,
                    voucher_code: code,
                    message: data.message ? data.message : 'Self Bought',
                    voucher_id: voucher[0].id,
                    status: 'Unused',
                    payment_amount: total
                };
                result = await query(insertQuery, dataToset)
                    .catch((err) => {
                        console.log(err);
                        throw err;
                    });

                const time = await query(timeQuery, result.insertId)
                    .catch((err) => {
                        console.log(err);
                        throw err;
                    });
            }

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Transaction success, put the amount at the pay request to complete the transaction',
                detail: {
                    userdetail: {
                        name: user[0].name,
                        phone: user[0].phone
                    },
                    amount_to_pay: total,
                    voucher_amount: voucher[0].amount,
                    quantity: data.qty
                }

            });
        } catch (error) {
            await query('Rollback');
            if (error.status) {
                res.status(error.status).send({
                    error: true,
                    message: error.message
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: error.message
                });
            }
        }
    },

    payTransaction: async (req, res) => {
        const data = req.body;

        let getUserQuery = 'SELECT * FROM user WHERE phone = ?';
        let getAmountQuery = 'SELECT * FROM user_voucher WHERE user_id = ? AND payment_status = ?';
        let payQuery = 'UPDATE user_voucher SET payment_status = ? WHERE id = ?';

        try {
            await query('Start Transaction');

            const user = await query(getUserQuery, data.phone)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });
            console.log(user);
            console.log(user[0].id);

            const amount = await query(getAmountQuery, [user[0].id, 'Unpaid'])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            console.log(amount);
            if (data.paymentAmount < amount[0].payment_amount) throw {
                error: true, message: `The amount you've entered is below the desired amount`, payment_amount: amount[0].payment_amount
            };

            const userVoucherID = amount.map((val) => (val.id));
            console.log(userVoucherID);

            for (let i = 0; i < userVoucherID.length; i++) {
                const updateStatus = await query(payQuery, ['Paid', userVoucherID[i]])
                    .catch((err) => {
                        console.log(err);
                        throw err;
                    });
            }

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Payment success, vouchers is now active'
            });
        } catch (error) {
            await query('Rollback');
            if (error.status) {
                res.status(error.status).send({
                    error: true,
                    message: error.message
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: error.message,
                    payment_amount: error.payment_amount
                });
            }
        }
    }
};