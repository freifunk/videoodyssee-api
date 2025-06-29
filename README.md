# VideoOdyssee API

🎥 **Modern, secure and production-ready API for video processing workflows**

[![Tests](https://img.shields.io/badge/tests-26%2F26%20passing-brightgreen)](https://github.com/freifunk/videoodyssee-api)
[![Coverage](https://img.shields.io/badge/coverage-81%25-green)](https://github.com/freifunk/videoodyssee-api)
[![Security](https://img.shields.io/badge/vulnerabilities-0-brightgreen)](https://github.com/freifunk/videoodyssee-api)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen)](https://nodejs.org/)

## 🚀 Features

- **🔐 Secure Authentication** with JWT tokens
- **📹 Video Management** with approval workflows  
- **🔄 Pipeline Integration** for automated video processing
- **📊 Professional Logging** with Winston (container-ready)
- **🏥 Health Monitoring** with `/health` endpoint
- **🐳 Container Native** - ready for Docker, Kubernetes, systemd
- **✅ Comprehensive Testing** with 81% code coverage
- **🛡️ Security Hardened** - 0 known vulnerabilities

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Logging](#logging)
- [Security](#security)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/freifunk/videoodyssee-api.git
cd videoodyssee-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

The API will be available at `http://localhost:8000`

### Health Check
```bash
curl http://localhost:8000/health
```

## 🔧 Environment Setup

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Authentication
EMAIL=admin@videoodyssee.com
PASSWORD=your-admin-password
JWT_SECRET=your-super-secret-jwt-key

# External Services
VOCTOWEB_URL=https://media.ccc.de
ACCESS_KEY=your-pipeline-access-key
API_KEY=your-api-key
PIPELINE_URL=https://videopipeline.freifunk.net/go/api/pipelines/processing-pipeline/schedule
```

## 📡 API Endpoints

### Authentication
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@videoodyssee.com",
  "password": "your-password"
}
```

### Video Management
```http
# Submit new video
POST /video
Content-Type: application/json

{
  "title": "My Video",
  "conference": "TestConf2024",
  "language": "English",
  "date": "2024-01-15",
  "url": "https://example.com/video.mp4",
  "name": "John Doe",
  "email": "john@example.com",
  "persons": ["Speaker 1", "Speaker 2"],
  "tags": ["tech", "conference"]
}

# List all videos
POST /video/list

# Approve video
POST /video/approve
{
  "id": "video-uuid"
}

# Reject video  
POST /video/reject
{
  "id": "video-uuid"
}
```

### Pipeline Triggers
```http
POST /pipeline/trigger
Content-Type: application/json

{
  "title": "Video Title",
  "event": "Conference Name",
  "language": "English",
  "date": "2024-01-15",
  "url": "https://example.com/video.mp4",
  "name": "Submitter Name",
  "email": "submitter@example.com",
  "persons": ["Speaker 1", "Speaker 2"],
  "tags": ["tag1", "tag2"]
}
```

### Monitoring
```http
GET /health
```

## 🛠️ Development

### Available Scripts

```bash
# Development with hot reload & colored logs
npm run dev

# Production mode with JSON logs
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests silently
npm run test:silent

# Debug mode
npm run debug
```

### Development Workflow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Run tests in watch mode:**
   ```bash
   npm test -- --watch
   ```

3. **Check test coverage:**
   ```bash
   npm run test:coverage
   ```

## 🧪 Testing

Comprehensive test suite with **26 tests** and **81% coverage**:

```bash
# Run all tests
npm test

# Generate coverage report
npm run test:coverage

# Run tests silently (useful for CI)
npm run test:silent
```

### Test Structure
- **Unit Tests**: `tests/utils/`
- **Route Tests**: `tests/routes/`
- **Integration Tests**: Full API workflow testing

## 🚀 Deployment

### 🐳 Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

### ☸️ Kubernetes

Deploy with the provided manifests:

```bash
kubectl apply -f deployment/kubernetes/deployment.yaml
```

Features:
- **3 replicas** for high availability
- **Health checks** (liveness & readiness probes)
- **Resource limits** (512Mi memory, 500m CPU)
- **Secret management** for sensitive data
- **ConfigMap** for configuration

### 🖥️ systemd

Install as a system service:

```bash
# Copy service file
sudo cp deployment/systemd/videoodyssee-api.service /etc/systemd/system/

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable videoodyssee-api
sudo systemctl start videoodyssee-api

# View logs
journalctl -u videoodyssee-api -f
```

### 🌐 Production Deployment

```bash
# Set production environment
export NODE_ENV=production

# Install production dependencies only
npm ci --only=production

# Start with process manager (PM2)
npm install -g pm2
pm2 start server.js --name videoodyssee-api

# Or use the systemd service
sudo systemctl start videoodyssee-api
```

## 📊 Logging

Professional logging with **Winston** - optimized for modern deployment environments:

### Environment-Based Logging

#### Development
- **Colored output** for easy reading
- **All log levels** (debug, info, warn, error)
- **Timestamps** with milliseconds

#### Production  
- **Structured JSON** for log aggregation
- **stdout/stderr** output (container-friendly)
- **Exception handling** built-in

#### Testing
- **Minimal output** (errors only)
- **Can be silenced** with `TEST_SILENT=true`

### Log Levels

```javascript
logger.error('❌ Critical error occurred');
logger.warn('⚠️ Warning message');
logger.info('✅ Information message');
logger.debug('🔍 Debug information');
```

### Log Aggregation

Perfect for:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki**
- **Fluentd/Fluent Bit**
- **systemd journald**

## 🛡️ Security

### Security Features
- ✅ **0 vulnerabilities** in dependencies
- ✅ **JWT authentication** with configurable secrets
- ✅ **Input validation** on all endpoints  
- ✅ **Error handling** without information leakage
- ✅ **CORS** protection
- ✅ **Rate limiting ready** (easily extensible)

### Dependency Management
- **Automated updates** with Renovate
- **Regular security audits** with `npm audit`
- **Minimal attack surface** with production-only dependencies

### systemd Security (Production)
- `NoNewPrivileges=true`
- `PrivateTmp=true` 
- `ProtectSystem=strict`
- `ProtectHome=true`

## 🔄 CI/CD

### GitHub Actions Ready

The project is structured for easy CI/CD integration:

```yaml
# Example workflow step
- name: Run tests
  run: npm test

- name: Check security
  run: npm audit

- name: Check coverage
  run: npm run test:coverage
```

## 📈 Monitoring

### Health Check Endpoint

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.123,
  "environment": "production"
}
```

### Kubernetes Probes

- **Liveness Probe**: `/health` (checks if app is running)
- **Readiness Probe**: `/health` (checks if app can serve traffic)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Run tests** (`npm test`)
4. **Commit** changes (`git commit -m 'Add amazing feature'`)
5. **Push** to branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **andibraeu** - *Current maintainer* - Modernized and maintained the project
- **Vijay Reddy** - *Original work* - [@0xVijayReddy](https://github.com/0xVijayReddy)

## 🙏 Acknowledgments

- Express.js community
- Winston logging library
- Jest testing framework
- All contributors and testers

---

**🎉 Ready for production deployment with modern DevOps practices!**
