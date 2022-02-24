#!/bin/bash

#db ssl paths
MONGO_DB_CONFIG_SSL_DIR="/etc/ssl"
MONGO_DB_CONFIG_SSL_LOCAL_DIR="db/mongo/ssl"
POSTGRES_DB_CONFIG_SSL_DIR="/Library/PostgreSQL/14/data"
POSTGRES_DB_CONFIG_SSL_LOCAL_DIR="db/postgres/ssl"

#app ssl paths
IAM_CONFIG_SSL_DIR="app/iam/ssl"
DELEGATE_CONFIG_SSL_DIR="app/delegate/ssl"
WEBAPP_CONFIG_SSL_DIR="app/webapp/ssl"

if [[ ( $2 == "gen" )]]
then
    echo "-------------------------------------------------------------"
    echo "Creating certs..."
    echo "-------------------------------------------------------------"

    # creates a new PKCS certificate and writes it in text to a file "server.req"
    openssl req -new -text -out server.req

    # pass phrase = CS681

    echo "-------------------------------------------------------------"
    echo "Creating key..."
    echo "-------------------------------------------------------------"
    # Unlocks the existing key and writes it to server.key
    openssl rsa -in privkey.pem -out server.key
    rm privkey.pem

    echo "-------------------------------------------------------------"
    echo "Creating cert..."
    echo "-------------------------------------------------------------"
    #turn the certificate into a self-signed certificate and to copy the key and certificate to where the server will look for them
    openssl req -x509 -in server.req -text -key server.key -out server.crt

    echo "-------------------------------------------------------------"
    echo "Updating permissions to key..."
    echo "-------------------------------------------------------------"
    # set permissions for the server
    chmod 0600 server.key

    echo "-------------------------------------------------------------"
    echo "Created certs: server.key, server.crt, server.req !!"
    echo "-------------------------------------------------------------"
fi

echo "-------------------------------------------------------------"
echo "Moving $1 certs..."
echo "-------------------------------------------------------------"

if [ "$1" = "postgres" ]
then
    # copy the postgres cert to the dir the iam will look for it
    cp server.crt $IAM_CONFIG_SSL_DIR/postgres.crt
    # move the postgres cert to the dir the postgres will look for it
    cp server.crt server.key server.req $POSTGRES_DB_CONFIG_SSL_LOCAL_DIR
    # delete req
    rm server.req
    # change owner to postgres
    sudo chown $1 server.key
    sudo chown $1 server.crt
    # move files
    sudo mv server.crt server.key $POSTGRES_DB_CONFIG_SSL_DIR
elif [ "$1" = "mongodb" ]
then
    # rename the mongo ssl files
    mv server.crt mongodb.crt
    mv server.key mongodb.key
    mv server.req mongodb.req
    # copy the mongo cert to the delegate ssl dir
    cp mongodb.crt $DELEGATE_CONFIG_SSL_DIR
    # move the ssl files to the mongo ssl dir
    cp mongodb.crt mongodb.key mongodb.req  $MONGO_DB_CONFIG_SSL_LOCAL_DIR
    sudo mv mongodb.crt mongodb.key mongodb.req  $MONGO_DB_CONFIG_SSL_DIR
elif [ "$1" = "iam" ]
then
    # rename the iam ssl files
    mv server.crt iam.crt
    mv server.key iam.key
    mv server.req iam.req
    # copy the iam cert to the postgres ssl dir
    sudo cp iam.crt $POSTGRES_DB_CONFIG_SSL_DIR/root.crt
    # copy the iam cert to the webapp ssl dir
    cp iam.crt $WEBAPP_CONFIG_SSL_DIR
    # move the iam ssl files to the iam ssl dir
    mv iam.crt iam.req iam.key $IAM_CONFIG_SSL_DIR
elif [ "$1" = "delegate" ]
then
    # rename the delegate ssl files
    mv server.crt delegate.crt
    mv server.key delegate.key
    mv server.req delegate.req
    # copy the delegate cert to the mongo ssl dir
    sudo cp delegate.crt $MONGO_DB_CONFIG_SSL_DIR/caToValidateClientCertificates.crt
    # copy the delegate cert to the webapp ssl dir
    cp delegate.crt $WEBAPP_CONFIG_SSL_DIR
    # move the delegate ssl files to the delegate ssl dir
    mv delegate.crt delegate.req delegate.key $DELEGATE_CONFIG_SSL_DIR
elif [ "$1" = "webapp" ]
then
    # rename the webapp ssl files
    mv server.crt webapp.crt
    mv server.key webapp.key
    mv server.req webapp.req
    # copy the webapp cert to the delegate and iam ssl dir
    cp webapp.crt $IAM_CONFIG_SSL_DIR
    cp webapp.crt $DELEGATE_CONFIG_SSL_DIR
    # move the webapp ssl files to the webapp ssl dir
    mv webapp.crt webapp.req webapp.key $WEBAPP_CONFIG_SSL_DIR
else
    echo "-------------------------------------------------------------"
    echo "Unknown app $1 !!"
    echo "-------------------------------------------------------------"
    exit 1
fi

echo "-------------------------------------------------------------"
echo "Done moving certs!!"
echo "-------------------------------------------------------------"
exit 0