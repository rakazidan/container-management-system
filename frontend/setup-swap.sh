#!/bin/bash

# Setup swap for t4g.micro (1GB RAM) - Recommended for stability
# Run this ONCE after launching EC2 instance

set -e

echo "🔧 Setting up 1GB swap for t4g.micro..."

# Check if swap already exists
if [ $(swapon --show | wc -l) -gt 0 ]; then
    echo "⚠️  Swap already exists:"
    swapon --show
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
    sudo swapoff -a
    sudo rm -f /swapfile
fi

# Create 1GB swap file
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024 status=progress

# Set correct permissions
sudo chmod 600 /swapfile

# Make swap
sudo mkswap /swapfile

# Enable swap
sudo swapon /swapfile

# Make swap permanent (survive reboots)
if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Optimize swap usage (use swap only when necessary)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# Verify
echo ""
echo "✅ Swap setup complete!"
echo ""
echo "Current memory status:"
free -h
echo ""
echo "Swap details:"
swapon --show
