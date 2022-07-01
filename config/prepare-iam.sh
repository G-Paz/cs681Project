sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu `lsb_release -cs` test"
sudo apt update
sudo apt install docker-ce

### move all security files to the server
## scp -i Assignment1-cs645.pem ./* ubuntu@ec2-44-201-208-19.compute-1.amazonaws.com:~/