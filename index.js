const express = require('express');
const bodyParser = require('body-parser');

var env = process.env.NODE_ENV || 'production';
var config = require('./config/config')[env];

const worklog = require('./routes/worklog.route');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/worklog', worklog);
app.listen(config.server.port, () => {
	console.log('Server is up and running on port numner ' + port);
});


// Set up mongoose connection
const mongoose = require('mongoose');
let mongoDBurl = 'mongodb://' + config.database.host + ':'+ config.database.port + '/' + config.database.db;
mongoose.connect(mongoDBurl);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

