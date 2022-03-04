# temp for quick refresh
mongosh mongodb://localhost:27017 --tls --tlsCertificateKeyFile ./ssl/delegate.pem --tlsCAFile ./ssl/mongodb.pem --file mongo_startup.js