const db = require('/home/edward/Desktop/express-biztime/db.js');

module.exports = async function() {
    await db.end();
};