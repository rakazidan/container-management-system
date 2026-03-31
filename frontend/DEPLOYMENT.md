# 🚀 Deployment Guide - EC2 + Docker

## Prasyarat
- EC2 instance running (Ubuntu/Amazon Linux)
- Security Group: Port 80 (HTTP) dan 22 (SSH) terbuka
- SSH key untuk akses EC2

---

## 📋 Step-by-Step Deployment

### 1️⃣ Persiapan Lokal

**Push code ke GitHub:**
```bash
git add .
git commit -m "Add Docker deployment files"
git push origin main
```

### 2️⃣ Connect ke EC2

**SSH ke instance:**
```bash
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
# Atau untuk Ubuntu:
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### 3️⃣ Install Docker & Docker Compose di EC2

**Untuk Amazon Linux 2:**
```bash
# Update packages
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply group changes
exit
```

**Untuk Ubuntu:**
```bash
# Update packages
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
exit
```

**Login kembali ke EC2:**
```bash
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
```

**Verify installation:**
```bash
docker --version
docker-compose --version
```

### 4️⃣ Clone Repository di EC2

```bash
# Install Git (jika belum ada)
sudo yum install git -y  # Amazon Linux
# atau
sudo apt-get install git -y  # Ubuntu

# Clone repository
git clone https://github.com/YOUR-USERNAME/container-management-system.git
cd container-management-system
```

### 5️⃣ Deploy Aplikasi

**Opsi A - Menggunakan script (Recommended):**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Opsi B - Manual:**
```bash
# Build dan jalankan
docker-compose up -d --build

# Check status
docker-compose ps
```

### 6️⃣ Verify Deployment

**Check container logs:**
```bash
docker-compose logs -f
```

**Test aplikasi:**
```bash
curl http://localhost/health
```

**Akses dari browser:**
```
http://YOUR-EC2-PUBLIC-IP
```

---

## 🔧 Management Commands

**View logs:**
```bash
docker-compose logs -f
```

**Restart aplikasi:**
```bash
docker-compose restart
```

**Stop aplikasi:**
```bash
docker-compose down
```

**Update aplikasi (setelah push ke GitHub):**
```bash
cd container-management-system
git pull origin main
./deploy.sh
```

**Check resource usage:**
```bash
docker stats
```

---

## 🔒 Setup HTTPS (Optional - Recommended untuk Production)

### Install Certbot & Setup SSL

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
# atau
sudo apt-get install -y certbot python3-certbot-nginx  # Ubuntu

# Get SSL certificate (ganti dengan domain Anda)
sudo certbot --nginx -d yourdomain.com
```

### Update nginx.conf untuk HTTPS
Setelah dapat certificate, Certbot akan auto-update nginx config.

---

## 📊 Monitoring

**Check EC2 resources:**
```bash
# CPU & Memory
top

# Disk usage
df -h

# Docker stats
docker stats
```

**Check container health:**
```bash
docker-compose ps
curl http://localhost/health
```

---

## 🐛 Troubleshooting

**Container tidak jalan:**
```bash
# Check logs
docker-compose logs

# Check Docker service
sudo service docker status

# Restart Docker
sudo service docker restart
```

**Port 80 tidak bisa diakses:**
```bash
# Check Security Group di AWS Console
# Pastikan port 80 terbuka untuk 0.0.0.0/0

# Check firewall di EC2
sudo iptables -L
```

**Out of memory:**
```bash
# Check memory usage
free -h

# Upgrade instance atau optimize
```

**Update tidak muncul:**
```bash
# Clear Docker cache
docker-compose down
docker system prune -a
./deploy.sh
```

---

## 💾 Backup & Restore

**Backup image:**
```bash
docker save container-management-system_container-management-app:latest | gzip > backup.tar.gz
```

**Restore image:**
```bash
docker load < backup.tar.gz
```

---

## 🎯 Performance Tips

1. **Enable swap** jika RAM terbatas:
```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

2. **Nginx caching** sudah dikonfigurasi di nginx.conf

3. **Monitor logs** dan rotate jika besar:
```bash
docker-compose logs --tail=100
```

---

## 📱 Akses Aplikasi

Setelah deployment berhasil:
- **HTTP:** http://YOUR-EC2-PUBLIC-IP
- **HTTPS** (jika sudah setup): https://yourdomain.com

Dapatkan Public IP EC2 di AWS Console → EC2 → Instances
