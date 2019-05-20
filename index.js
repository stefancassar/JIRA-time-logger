const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const request = require('request');
const moment = require('moment');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './config/token.json';

// Load client secrets from a local file.
fs.readFile('./config/credentials.json', (err, content) => {
	if (err) return console.log('Error loading client secret file:', err);
	// Authorize a client with credentials, then call the Google Calendar API.
	authorize(JSON.parse(content), getTimeLogFromStartDate);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	const {client_secret, client_id, redirect_uris} = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(
		client_id, client_secret, redirect_uris[0]);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getAccessToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

var env = process.env.NODE_ENV || 'production';
var config = require('./config/config')[env];

function getTimeLogFromStartDate(auth) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: config.calendar.id,
		timeMin: "2019-03-01T00:00:00+00:00",
		timeMax: "2019-03-04T00:00:00+00:00",
		// maxResults: 10,
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = res.data.items;
		if (events.length) {
			console.log('Time Log:');
			var workLogs = [];
			events.forEach(function (eventItem) {
				const start = eventItem.start.dateTime;
				const end = eventItem.end.dateTime;
				const durationInSeconds = (new Date(end) - new Date(start)) / 1000;
				workLogs.push(
					{
						"issueKey": (eventItem.summary).split(" ", 1)[0],
						"description": (eventItem.description) ? eventItem.description : null,
						"duration": durationInSeconds,
						"startTime": moment(start).format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
					}
				)
			});
			workLogs.forEach(function (worklog) {
				console.info("Issue = ", worklog.issueKey, "Description: ", worklog.description, " Duration: ", worklog.duration, " Starttime: ", worklog.startTime)
			})
			bulkLogWork(workLogs);

		} else {
			console.log('No time logged.');
		}
	});
}


function bulkLogWork(workLogArray) {
	workLogArray.forEach(function (worklog) {
		logWork(worklog.issueKey, worklog.startTime, worklog.duration, worklog.description)
	})
}

function logWork(issueKey, startDateTime, durationInSeconds, comment) {
	var options = {
		method: 'POST',
		url: 'https://addajet.atlassian.net/rest/api/3/issue/' + issueKey + '/worklog',
		// auth: { bearer: config.atlassian.token },
		json: true,
		headers: {
			'Authorization': 'Basic ' + config.atlassian.token,
			'Accept': 'application/json'
		},
		body: {
			"started": startDateTime,
			"timeSpentSeconds": durationInSeconds
		}
	};

	if (comment) {
		options.body.comment = {
			"version": 1,
			"type": "doc",
			"content": [
				{
					"type": "paragraph",
					"content": [
						{
							"type": "text",
							"text": comment
						}
					]
				}
			]
		};
	}

	request(options, function (error, response, body) {
		if (error) console.error(error);
		console.log(
			'Response: ' + issueKey + ' ' + response.statusCode
		);
	});

}