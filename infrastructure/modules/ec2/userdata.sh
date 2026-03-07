#!/bin/bash
set -e

# 1. Create a 2GB Swap file to prevent Out-Of-Memory (OOM) errors on the 1GB t3.micro
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# 2. Update packages and install prerequisites
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release

# 3. Add Docker's official GPG key and repository
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker and Docker Compose plugin
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. Start and enable Docker
systemctl enable docker
systemctl start docker

# 6. Add default ubuntu user to docker group (so you don't need sudo for docker)
usermod -aG docker ubuntu

echo "Docker and Swap initialization completed successfully."
