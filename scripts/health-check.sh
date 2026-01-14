#!/bin/bash
# RepoDocs Health Check Script
# VPS'te çalıştır: bash health-check.sh

echo "=========================================="
echo "🔍 RepoDocs Health Check"
echo "=========================================="

# 1. Container durumu
echo -e "\n📦 CONTAINER DURUMU:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "repodocs|postgres|redis"

# 2. Container logları (son 20 satır)
echo -e "\n📋 APP LOGLARI (son 20 satır):"
docker logs --tail 20 $(docker ps -q -f name=repodocs-app) 2>/dev/null || echo "Container bulunamadı"

# 3. Redis bağlantı testi
echo -e "\n🔴 REDIS TEST:"
docker exec $(docker ps -q -f name=redis) redis-cli ping 2>/dev/null || echo "Redis bağlantı hatası"

# 4. PostgreSQL bağlantı testi
echo -e "\n🐘 POSTGRESQL TEST:"
docker exec $(docker ps -q -f name=postgres) pg_isready 2>/dev/null || echo "PostgreSQL bağlantı hatası"

# 5. HTTP endpoint testleri
echo -e "\n🌐 HTTP TESTLERİ:"

test_url() {
    local url=$1
    local start=$(date +%s%N)
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    local end=$(date +%s%N)
    local time=$(( (end - start) / 1000000 ))
    
    if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
        echo "✅ [$status] ${time}ms - $url"
    else
        echo "❌ [$status] ${time}ms - $url"
    fi
}

test_url "http://localhost:3000/"
test_url "http://localhost:3000/login"
test_url "http://localhost:3000/api/auth/providers"

# 6. Memory ve CPU
echo -e "\n💻 KAYNAK KULLANIMI:"
echo "Memory:"
free -h | head -2
echo -e "\nDocker stats:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "repodocs|postgres|redis"

# 7. Disk
echo -e "\n💾 DISK:"
df -h / | tail -1

echo -e "\n=========================================="
echo "✅ Health Check Tamamlandı"
echo "=========================================="
