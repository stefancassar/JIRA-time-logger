const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let WorkLogSchema = new Schema({
	task: {type: String, required: true, max: 7},
	description: {type: String, required: false, max: 300},
	duration: {type: Number, required: true},
	date: {type: Date, required: true},
});


// Export the model
module.exports = mongoose.model('WorkLog', WorkLogSchema);