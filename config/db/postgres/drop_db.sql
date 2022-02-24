-- drops the chess database and roles related
DROP DATABASE chess;
DROP OWNED BY gamemaster;
DROP ROLE gamemaster;
DROP OWNED BY iam_app;
DROP ROLE iam_app;
DROP GROUP masters;
DROP GROUP apps;