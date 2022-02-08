const randomString = () => {
    let result = '';
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charLength = char.length;

    const minute = 1000 * 60;
    const hours = minute * 60;

    let date = Math.round(Date.now() / hours);

    for (let i = 0; i < 6; i++) {
        result += char.charAt(Math.floor(Math.random() * charLength));
    }
    result += date;
    return result;
};

module.exports = randomString;