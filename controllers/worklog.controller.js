const Worklog = require('../models/worklog.model');

//Simple version, without validation or sanitation
exports.test = function (req, res) {
	res.send('Greetings from the Test controller!');
};

exports.worklog_create = function (req, res) {
	let worklog = new Worklog(
		{
			task: req.body.task,
			description: req.body.description,
			duration: req.body.duration,
			date: req.body.date,
		}
	);

	worklog.save(function (err) {
		if (err) {
			return next(err);
		}
		res.send('Worklog Created successfully')
	})
};

