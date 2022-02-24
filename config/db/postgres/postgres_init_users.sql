-- create masters db group
create group masters;

-- create gamemasters user and assign it to the masters group - used to manage the chess schema
create user gamemaster in group masters encrypted password '<gamemaster_password>';

-- create apps db group
create group apps;

-- create iam_app user and assign it to the apps group - used to modify user data in chess schema
create user iam_app in group apps encrypted password '<iam_app_password>';

-- create new chess database to manage the game states
create database chess OWNER postgres;
