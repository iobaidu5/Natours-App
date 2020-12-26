const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app.js');

dotenv.config({ path: './config.env'});

process.on('uncaughtException', err => {
    console.log('uncaughtException! Shutting Down');
    console.log(err.name, err.message);
    
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log("Database Connected"));



//  SERVER LISTENING
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Server Listening on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log('unhandledRejection! Shutting down');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});