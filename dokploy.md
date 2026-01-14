# RepoDocs → Dokploy Deploy Rehberi

## Ön Hazırlık (Yerel)

### 1. GitHub OAuth App Oluştur
1. https://github.com/settings/developers → **New OAuth App**
2. Ayarlar:
   - Application name: `RepoDocs`
   - Homepage URL: `https://repodocs.SENIN-DOMAIN.com`
   - Authorization callback URL: `https://repodocs.SENIN-DOMAIN.com/api/auth/callback/github`
3. **Client ID** ve **Client Secret** kaydet

### 2. Secret'ları Hazırla
```powershell
# NEXTAUTH_SECRET oluştur (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# GITHUB_WEBHOOK_SECRET oluştur
[Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

## Dokploy Kurulumu

### 3. VPS'e Dokploy Kur (SSH ile)
```bash
curl -sSL https://dokploy.com/install.sh | sh
```
- Kurulum bitince: `https://VPS-IP:3000` aç
- Admin hesabı oluştur

### 4. Dokploy'da Proje Oluştur
1. **Projects** → **Create Project** → İsim: `repodocs`
2. Proje içine gir

---

## Database Servisleri

### 5. PostgreSQL Ekle
1. **Create Service** → **Database** → **PostgreSQL**
2. Ayarlar:
   - Name: `postgres`
   - Database Name: `repodocs`
   - Database User: `repodocs`
   - Database Password: `GUCLU-SIFRE-OLUSTUR`
3. **Create** → Başlamasını bekle

### 6. Redis Ekle
1. **Create Service** → **Database** → **Redis**
2. Ayarlar:
   - Name: `redis`
   - Password: (boş bırakabilirsin)
3. **Create** → Başlamasını bekle

---

## Uygulama Deploy

### 7. Application Oluştur
1. **Create Service** → **Application**
2. Ayarlar:
   - Name: `app`
   - Provider: **GitHub**
   - Repository: `doctorcmptrmita2/RepoDocs` (veya senin fork'un)
   - Branch: `main`
3. **Create**

### 8. Environment Variables Ekle
Application → **Environment** sekmesi → şunları ekle:

```env
# Database (Dokploy internal hostname)
DATABASE_URL=postgresql://repodocs:POSTGRES-SIFREN@repodocs-postgres:5432/repodocs

# Redis (Dokploy internal hostname)
REDIS_URL=redis://repodocs-redis:6379

# NextAuth
NEXTAUTH_URL=https://repodocs.SENIN-DOMAIN.com
NEXTAUTH_SECRET=OLUSTURDUGUN-SECRET

# Domain
NEXT_PUBLIC_DOMAIN=repodocs.SENIN-DOMAIN.com

# GitHub OAuth
GITHUB_CLIENT_ID=GITHUB-CLIENT-ID
GITHUB_CLIENT_SECRET=GITHUB-CLIENT-SECRET
GITHUB_WEBHOOK_SECRET=OLUSTURDUGUN-WEBHOOK-SECRET

# Dokploy API (Custom Domain Otomasyonu için)
DOKPLOY_URL=https://VPS-IP:3000
DOKPLOY_API_KEY=ADIM-9-DA-OLUSTURACAKSIN
DOKPLOY_APPLICATION_ID=ADIM-10-DA-BULACAKSIN
```

### 9. Dokploy API Key Oluştur
1. Dokploy → **Settings** (sağ üst) → **Profile**
2. **API/CLI Section** → **Generate Token**
3. Token'ı kopyala → `DOKPLOY_API_KEY` olarak ekle

### 10. Application ID Bul
1. Application sayfasındayken URL'e bak:
   ```
   https://dokploy:3000/dashboard/project/xxx/services/application/APP-ID-BURASI
   ```
2. Son kısımdaki ID'yi kopyala → `DOKPLOY_APPLICATION_ID` olarak ekle

---

## Build & Deploy

### 11. İlk Deploy
1. Application → **Deployments** sekmesi
2. **Deploy** butonuna tıkla
3. Build loglarını takip et (5-10 dk sürebilir)
4. ✅ **Success** görene kadar bekle

### 12. Database Migration
1. Application → **Terminal** sekmesi (veya SSH)
2. Çalıştır:
   ```bash
   npx prisma db push
   ```

---

## Domain Ayarları

### 13. Ana Domain Ekle (Dokploy)
1. Application → **Domains** sekmesi
2. **Create Domain**
3. Ayarlar:
   - Host: `repodocs.SENIN-DOMAIN.com`
   - Port: `3000`
   - HTTPS: ✅ Enabled
   - Certificate: `Let's Encrypt`
4. **Create**

### 14. DNS Kayıtları (Domain Sağlayıcı)
Domain panelinde (Cloudflare, Namecheap, vb.):

```
Tip    Host                          Değer
A      repodocs                      VPS-IP-ADRESIN
A      *.repodocs                    VPS-IP-ADRESIN  (wildcard - subdomain için)
```

⚠️ DNS propagation 5-30 dakika sürebilir

### 15. SSL Kontrolü
- `https://repodocs.SENIN-DOMAIN.com` aç
- 🔒 Kilit ikonu görünmeli
- Görmüyorsan 5-10 dk bekle, Traefik otomatik alacak

---

## Test

### 16. Fonksiyon Testi
1. Ana sayfayı aç → Yüklenmeli
2. **Sign In** → GitHub ile giriş yap
3. **New Project** → Repo seç → Oluştur
4. **Settings** → Custom Domain ekle
5. Domain otomatik Dokploy'a eklenmeli ✅

---

## Sorun Giderme

### Build Hatası
```bash
# Dokploy > Application > Deployments > son deployment'a tıkla > Logs
```

### Database Bağlantı Hatası
- `DATABASE_URL` hostname'i `repodocs-postgres` mi?
- PostgreSQL servisi **Running** durumda mı?

### Redis Bağlantı Hatası
- `REDIS_URL` hostname'i `repodocs-redis` mi?
- Redis servisi **Running** durumda mı?

### Custom Domain Eklenmiyor
- `DOKPLOY_API_KEY` geçerli mi? (Settings'ten yeni oluştur)
- `DOKPLOY_APPLICATION_ID` doğru mu? (URL'den kontrol et)
- Dokploy loglarını kontrol et

### SSL Hatası
- DNS propagation bekle
- Dokploy → Application → Domains → Certificate durumunu kontrol et

---

## Özet Checklist

- [ ] GitHub OAuth App oluşturuldu
- [ ] Dokploy VPS'e kuruldu
- [ ] PostgreSQL servisi oluşturuldu
- [ ] Redis servisi oluşturuldu
- [ ] Application oluşturuldu
- [ ] Environment variables eklendi
- [ ] API Key oluşturuldu
- [ ] Application ID bulundu
- [ ] İlk deploy yapıldı
- [ ] Database migration çalıştırıldı
- [ ] Ana domain eklendi
- [ ] DNS kayıtları yapıldı
- [ ] SSL aktif
- [ ] Test başarılı
