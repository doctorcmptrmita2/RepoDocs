# 🚀 Deploy: Docs Branding Feature

## Pre-Deploy Checklist

### 1. Database Migration (ZORUNLU)
Production veritabanında bu SQL'i çalıştır:

```sql
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "branding" JSONB DEFAULT '{}';
```

**Easypanel'de:**
1. PostgreSQL servisine git
2. Terminal aç veya pgAdmin kullan
3. SQL'i çalıştır

### 2. Build Kontrolü
```bash
npm run build
```
✅ Build başarılı (test edildi)

### 3. Yeni Dosyalar
```
src/types/branding.ts
src/lib/branding/validation.ts
src/lib/branding/index.ts
src/app/api/projects/[slug]/branding/route.ts
src/components/docs/BrandedHeader.tsx
src/components/docs/BrandedFooter.tsx
src/components/docs/BrandingProvider.tsx
src/components/docs/DynamicFavicon.tsx
src/components/dashboard/BrandingForm.tsx
src/components/dashboard/BrandingPreview.tsx
```

### 4. Değiştirilen Dosyalar
```
prisma/schema.prisma (branding field eklendi)
src/lib/cache/index.ts (branding cache fonksiyonları)
src/app/globals.css (input styles)
src/app/(dashboard)/dashboard/[slug]/settings/page.tsx (Branding section)
src/app/(docs)/docs/[project]/[version]/layout.tsx (branding entegrasyonu)
src/app/custom-domain/[[...slug]]/page.tsx (branding entegrasyonu)
src/components/docs/Sidebar.tsx (branding props)
src/components/docs/MobileSidebar.tsx (branding props)
```

---

## Deploy Adımları

### Adım 1: Git Push
```bash
git add .
git commit -m "feat: Add docs branding customization feature

- Logo, favicon, site title, primary color
- Footer text and links
- Social links (GitHub, Twitter, Discord)
- Hide 'Powered by RepoDocs' (PRO/TEAM)
- Custom CSS injection (PRO/TEAM)
- Google Analytics integration
- Default theme setting
- Settings UI with live preview"

git push origin main
```

### Adım 2: Database Migration
Easypanel PostgreSQL'de çalıştır:
```sql
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "branding" JSONB DEFAULT '{}';
```

### Adım 3: Easypanel Rebuild
1. Easypanel dashboard'a git
2. RepoDocs servisini seç
3. "Rebuild" butonuna tıkla
4. Build loglarını izle

### Adım 4: Verify
Deploy sonrası kontrol:
```bash
# Health check
curl https://repodocs.dev/api/health

# Debug endpoint (branding field görünmeli)
curl https://repodocs.dev/api/debug

# Settings sayfasını test et
# https://repodocs.dev/dashboard/agentwall/settings
```

---

## Özellik Kullanımı

### Dashboard'dan Branding Ayarları
1. https://repodocs.dev/dashboard/{proje}/settings
2. "Branding" bölümüne scroll et
3. Ayarları yap:
   - Logo URL (örn: https://github.com/user/repo/raw/main/logo.png)
   - Favicon URL
   - Site Title
   - Primary Color (renk seçici ile)
   - Footer Text
   - Footer Links (max 5)
   - Social Links
4. "Save Changes" tıkla

### PRO/TEAM Özellikleri
- Hide "Powered by RepoDocs" - PRO/TEAM
- Custom CSS - PRO/TEAM

---

## Rollback (Gerekirse)

Eğer sorun çıkarsa:
```sql
-- Branding sütununu kaldır (veri kaybı!)
ALTER TABLE "Project" DROP COLUMN IF EXISTS "branding";
```

Ve önceki commit'e dön:
```bash
git revert HEAD
git push origin main
```

---

## Test Sonrası

Deploy başarılı olduktan sonra:
1. https://repodocs.dev/dashboard/agentwall/settings adresine git
2. Branding bölümünü test et
3. Logo ekle, renk değiştir
4. https://docs.agentwall.io adresinde değişiklikleri kontrol et
