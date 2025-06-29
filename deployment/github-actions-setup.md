# GitHub Actions SSH Deployment Setup

## 🔐 Required Secrets

Konfiguriere diese Secrets in deinem GitHub Repository unter **Settings > Secrets and variables > Actions**:

```
DEPLOY_HOST=dein-server.example.com
DEPLOY_USER=deploy
DEPLOY_KEY=-----BEGIN OPENSSH PRIVATE KEY----- [dein SSH private key] -----END OPENSSH PRIVATE KEY-----
DEPLOY_PORT=22                                    # Optional, Standard: 22
DEPLOY_PATH=/opt/videoodyssee-api                # Optional, Standard: /opt/videoodyssee-api
```

## 🚀 Deployment Workflow

### Bei jedem Push auf `main`:
1. ✅ Tests laufen durch (Node 18 + 20)
2. ✅ Security Audit 
3. ✅ SSH-Deployment auf Server
4. ✅ Health Check

### Deployment Prozess:
```bash
# Läuft automatisch auf dem Server:
cd /opt/videoodyssee-api
git fetch origin
git reset --hard origin/main
npm ci --only=production
sudo systemctl restart videoodyssee-api

# Verify deployment
curl -f http://localhost:8000/health
```

## 🔧 Server Setup

### 1. Deploy User erstellen
```bash
# Auf dem Server
sudo useradd -m deploy
sudo usermod -aG sudo deploy
sudo -u deploy mkdir -p /home/deploy/.ssh
```

### 2. SSH Key konfigurieren
```bash
# SSH Key hinzufügen
sudo -u deploy nano /home/deploy/.ssh/authorized_keys
# -> Füge deinen PUBLIC key hinzu

# Permissions setzen
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### 3. Sudoers für Deployment
```bash
# Deployment user darf systemctl ohne Passwort
sudo visudo
# Hinzufügen:
deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart videoodyssee-api
deploy ALL=(ALL) NOPASSWD: /bin/systemctl start videoodyssee-api
deploy ALL=(ALL) NOPASSWD: /bin/systemctl stop videoodyssee-api
```

### 4. Repository auf Server
```bash
# Git Repository clonen
sudo mkdir -p /opt/videoodyssee-api
sudo chown deploy:deploy /opt/videoodyssee-api
sudo -u deploy git clone https://github.com/freifunk/videoodyssee-api.git /opt/videoodyssee-api
cd /opt/videoodyssee-api
sudo -u deploy npm ci --only=production

# .env Datei erstellen
sudo -u deploy cp .env.example .env
sudo -u deploy nano .env  # Konfiguration anpassen
```

### 5. systemd Service (falls noch nicht vorhanden)
```bash
# Service installieren
sudo cp deployment/systemd/videoodyssee-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable videoodyssee-api
sudo systemctl start videoodyssee-api
```

## 🔍 Testing

### SSH Verbindung testen:
```bash
ssh deploy@dein-server.example.com
```

### Deployment manuell testen:
```bash
ssh deploy@dein-server.example.com "cd /opt/videoodyssee-api && git pull && npm ci --only=production"
```

### Health Check:
```bash
curl -f http://dein-server.example.com:8000/health
```

## 🎯 Features

- ✅ **Einfach & Zuverlässig**: Nur SSH, keine Container-Komplexität
- ✅ **Zero-Downtime**: systemctl restart ist schnell (< 2 Sekunden)
- ✅ **Rollback Ready**: `git reset --hard` für sofortiges Rollback
- ✅ **Automatische Health Checks**: Deployment schlägt fehl wenn API nicht erreichbar
- ✅ **Multi-Node Testing**: Tests auf 18.x und 20.x
- ✅ **Sichere Secrets**: SSH Keys über GitHub Secrets

## 🚨 Troubleshooting

### Deployment schlägt fehl:
```bash
# SSH Verbindung prüfen
ssh deploy@dein-server.example.com

# Server Logs prüfen
ssh deploy@dein-server.example.com "journalctl -u videoodyssee-api -f"

# Git Status prüfen
ssh deploy@dein-server.example.com "cd /opt/videoodyssee-api && git status"
```

### Health Check schlägt fehl:
```bash
# Service Status
ssh deploy@dein-server.example.com "systemctl status videoodyssee-api"

# Logs der letzten 50 Einträge
ssh deploy@dein-server.example.com "journalctl -u videoodyssee-api -n 50"

# Port prüfen
ssh deploy@dein-server.example.com "netstat -tlnp | grep 8000"
```

### Rollback bei Problemen:
```bash
# Zum vorherigen Commit zurück
ssh deploy@dein-server.example.com "cd /opt/videoodyssee-api && git log --oneline -5"
ssh deploy@dein-server.example.com "cd /opt/videoodyssee-api && git reset --hard <commit-hash>"
ssh deploy@dein-server.example.com "sudo systemctl restart videoodyssee-api"
```

## 📋 Checklist für Setup

- [ ] Deploy User auf Server erstellt
- [ ] SSH Key auf Server konfiguriert  
- [ ] Sudoers Eintrag hinzugefügt
- [ ] Repository geclont nach `/opt/videoodyssee-api`
- [ ] `.env` Datei konfiguriert
- [ ] systemd Service installiert und gestartet
- [ ] GitHub Secrets konfiguriert (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`)
- [ ] Test-Push auf `main` Branch gemacht
- [ ] Health Check erfolgreich

**🎉 Danach läuft bei jedem Push auf `main` automatisch das Deployment!** 