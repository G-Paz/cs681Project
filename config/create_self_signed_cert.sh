#!/bin/bash

#db ssl paths
MONGO_DB_CONFIG_SSL_DIR="/etc/ssl"
MONGO_DB_CONFIG_SSL_LOCAL_DIR="db/mongodb/ssl"
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
    #configure the pem for mongodb
    cat server.key server.crt > mongodb.pem
    # copy the mongo cert to the delegate ssl dir
    cp mongodb.pem $DELEGATE_CONFIG_SSL_DIR
    # move the ssl files to the mongo ssl dir
    sudo cp mongodb.pem $MONGO_DB_CONFIG_SSL_DIR
    # move files to local dir
    mv mongodb.pem $MONGO_DB_CONFIG_SSL_LOCAL_DIR
    #delete the sec files
    rm server.req server.key server.crt
elif [ "$1" = "iam" ]
then
    # rename the iam ssl files
    mv server.crt iam.crt
    mv server.key iam.key
    mv server.req iam.req
    #configure the pem for the tls server
    cat iam.key iam.crt > iam.pem
    # copy the iam cert to the postgres ssl dir
    sudo cp iam.crt $POSTGRES_DB_CONFIG_SSL_DIR/root.crt
    # copy the iam cert to the webapp ssl dir
    cp iam.crt iam.key $WEBAPP_CONFIG_SSL_DIR
    # move the iam ssl files to the iam ssl dir
    mv iam.crt iam.req iam.key iam.pem $IAM_CONFIG_SSL_DIR
elif [ "$1" = "delegate" ]
then
    #configure the pem for mongodb
    cat server.key server.crt > delegate.pem
    # rename the key
    mv server.key delegate.key
    # copy the delegate cert to the mongo ssl dir
    sudo cp delegate.pem $MONGO_DB_CONFIG_SSL_DIR
    sudo cp delegate.pem $MONGO_DB_CONFIG_SSL_LOCAL_DIR
    # copy the delegate cert to the webapp ssl dir
    cp delegate.pem delegate.key $WEBAPP_CONFIG_SSL_DIR
    # move the delegate ssl files to the delegate ssl dir
    mv delegate.pem delegate.key $DELEGATE_CONFIG_SSL_DIR
    #delete the sec files
    rm server.req server.crt
elif [ "$1" = "webapp" ]
then
    # rename the webapp ssl files
    mv server.crt webapp.crt
    mv server.key webapp.key
    mv server.req webapp.req
    #configure the pem for mongodb
    cat webapp.key webapp.crt > webapp.pem
    # copy the webapp cert to the delegate and iam ssl dir
    cp webapp.crt webapp.pem $IAM_CONFIG_SSL_DIR
    cp webapp.crt webapp.pem $DELEGATE_CONFIG_SSL_DIR
    # move the webapp ssl files to the webapp ssl dir
    mv webapp.crt webapp.req webapp.key webapp.pem $WEBAPP_CONFIG_SSL_DIR
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