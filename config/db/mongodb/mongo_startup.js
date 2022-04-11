// change to the chess db and refresh
db.dropDatabase('chess');
db.dropAllUsers();

// Provides all the privileges of the read role plus ability to modify data on all non-system collections 
// and the system.js collection.
db.createUser({
    user: "delegate",
    pwd: "<delegate_app_password>",
    roles: [{ role: "readWrite", db: "chess" }]
});

// Provides the ability to perform administrative tasks such as schema-related tasks,
// indexing, and gathering statistics. This role does not grant privileges for user and role management.
db.createUser({
    user: "gamemaster",
    pwd: "<gamemaster_password>",
    roles: [{ role: "dbAdmin", db: "chess" }]
});

