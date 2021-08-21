require('dotenv').config();

const DB_URI = process.env.NODE_ENV === 'test' ? process.env.TEST_DB_URI : process.env.DB_URI;
const { PORT } = process.env;

module.exports = {
    DB_URI,
    PORT,
};
