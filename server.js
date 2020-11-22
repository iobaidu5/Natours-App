const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app.js');

dotenv.config({ path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log("Database Connected"));



//  SERVER LISTENING
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server Listening on port ${port}`);
});