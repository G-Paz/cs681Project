-- create masters db group
create group masters;

-- create gamemasters user and assign it to the masters group - used to manage the chess tables
create user gamemaster in group masters encrypted password '<gamemaster_password>';

-- create apps db group
create group apps;

-- create gamemasters user and assign it to the masters group - used to manage the chess tables
create user iam_app in group apps encrypted password '<iam_app_password>';

-- create new chess database to manage the game states
create database chess OWNER postgres;
