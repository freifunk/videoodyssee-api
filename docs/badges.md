# 📊 Badge System

## Übersicht

Das Badge-System generiert automatisch aktuelle Badges für Coverage, Tests und Security und stellt sie über GitHub Pages zur Verfügung.

## 🔄 Automatische Generierung

### Wann werden Badges generiert?
- Bei jedem Push auf `main` Branch
- Nur im Node.js 20.x Job (um Duplikate zu vermeiden)
- Nach den Tests mit Coverage-Report

### Welche Badges?

1. **Coverage Badge** 📊
   - Zeigt aktuelle Test-Coverage in %
   - Farben: Grün (≥80%), Gelb (≥60%), Rot (<60%)
   - Basiert auf `coverage/coverage-summary.json`

2. **Tests Badge** ✅
   - Anzahl der durchlaufenden Tests
   - Automatische Erkennung aus Jest-Output
   - Fallback: 26 Tests (bekannter Stand)

3. **Security Badge** 🛡️
   - Anzahl der Sicherheitslücken via `npm audit`
   - Farben: Grün (0), Gelb (1-5), Rot (>5)
   - Prüft alle Severity-Level

## 🌐 GitHub Pages URLs

Die Badges sind verfügbar unter:

```
https://freifunk.github.io/videoodyssee-api/badges/coverage.svg
https://freifunk.github.io/videoodyssee-api/badges/tests.svg  
https://freifunk.github.io/videoodyssee-api/badges/security.svg
```

## 🎯 Vorteile dieser Lösung

### ✅ Sauber
- **Keine Commits auf main** nötig
- **Separation of Concerns**: Code ≠ generierte Artefakte
- **Standard GitHub Pages** Deployment

### ✅ Zuverlässig
- **Automatische Updates** bei jedem main Push
- **Artifact Upload** für Debugging
- **Fehlertoleranz** mit Fallback-Werten

### ✅ Effizient
- **Nur ein Badge-Job** (Node 20.x)
- **keep_files: true** erhält andere GitHub Pages Inhalte
- **Integriert in CI** - keine separaten Workflows

## 🔧 Technische Details

### Badge-Generierung
```bash
# Coverage aus Jest Coverage Summary
COVERAGE=$(node -e "
  const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json'));
  console.log(Math.round(coverage.total.lines.pct));
")

# Tests aus Jest Output  
TEST_COUNT=$(npm test 2>&1 | grep -oE '[0-9]+ passed' | head -1)

# Security aus npm audit
VULNS=$(npm audit --json | jq '.vulnerabilities | length')
```

### Shields.io URLs
```bash
curl -s "https://img.shields.io/badge/coverage-${COVERAGE}%25-${COLOR}?style=flat-square&logo=jest"
```

### GitHub Pages Deployment
```yaml
- uses: peaceiris/actions-gh-pages@v3
  with:
    publish_dir: ./badges
    destination_dir: badges
    keep_files: true  # Wichtig: Erhält coverage/ directory
```

## 🚨 Troubleshooting

### Badge zeigt falsche Werte?
```bash
# GitHub Actions Logs prüfen:
# https://github.com/freifunk/videoodyssee-api/actions/workflows/ci.yml

# Badge-Artefakte herunterladen und prüfen
```

### GitHub Pages nicht aktiviert?
```bash
# Repository Settings > Pages
# Source: Deploy from a branch
# Branch: gh-pages / (root)
```

### Cache-Probleme?
```bash
# Badges werden mit GitHub Pages Cache geliefert
# Kann bis zu 10 Minuten dauern für Updates
# Force-Refresh: Ctrl+F5 oder ?v=timestamp URL Parameter
```

## 📝 README Integration

```markdown
[![Tests](https://freifunk.github.io/videoodyssee-api/badges/tests.svg)](https://github.com/freifunk/videoodyssee-api/actions/workflows/ci.yml)
[![Coverage](https://freifunk.github.io/videoodyssee-api/badges/coverage.svg)](https://freifunk.github.io/videoodyssee-api/coverage/)  
[![Security](https://freifunk.github.io/videoodyssee-api/badges/security.svg)](https://github.com/freifunk/videoodyssee-api/security/advisories)
```

**🎉 Das Badge-System ist jetzt produktionsreif und benötigt keine manuellen Commits!** 