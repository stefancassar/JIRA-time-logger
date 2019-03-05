# JIRA-time-logger
Node App to convert Google Calendar entries into JIRA work logs

## Configs
1. Google calendar ID
2. Generate Google Auth credentials and add file in /config
3. Atlassian Auth token


## Logging
Enter logs as events in calendar using the following format:

**Event name:** 

    <jira-id> <optional-description>
    
   Also supported:
   - Log Summary (logged as work-log description)

## Fetching Events and Work Log conversion
Update the timeMin and timeMax parameters with the region of days to log. 
Run index.js as entry point. When running the following processes are performed:

1. Events in the date-min and date-max are fetched from google calendar.
2. Events are converted to list of logs (duration included)
3. Atlassian API is used to sequentially log events

### Output
List of issue keys and status codes. 
