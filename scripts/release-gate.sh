#!/bin/bash
set -e

echo "===================================================="
echo "🛡️  WEALTH OS — Release Gate Verification Checklist"
echo "===================================================="
echo ""

# 1. Secret Exposure Check
echo "🔍 [1/5] Memeriksa paparan file rahasia (.env)..."
if git ls-files | grep -E '\.env$|\.env\.local$|\.env\.production$' > /dev/null; then
  echo "❌ DITEMUKAN FILE .ENV TERCATAT DI GIT! Batalkan rilis!"
  exit 1
fi
echo "   ✅ Aman: Tidak ada berkas rahasia .env yang terpapar di repositori git."

# 2. TypeScript Compilation Check
echo ""
echo "🔍 [2/5] Menjalankan pemeriksaan tipe TypeScript (typecheck)..."
npm run typecheck
echo "   ✅ TypeScript bersih: 0 error."

# 3. Unit & Integration Test Suite
echo ""
echo "🔍 [3/5] Menjalankan seluruh test suite Vitest (M1 - M9)..."
npx vitest run
echo "   ✅ Seluruh pengujian lulus 100%!"

# 4. Production Build Check
echo ""
echo "🔍 [4/5] Membangun bundle produksi Next.js (production build)..."
npm run build
echo "   ✅ Bundle Next.js berhasil dikompilasi untuk produksi."

# 5. Git Status Check
echo ""
echo "🔍 [5/5] Memeriksa status Git..."
DIRTY=$(git status --porcelain)
if [ -n "$DIRTY" ]; then
  echo "⚠️  Perhatian: Ada perubahan belum ter-commit di working directory."
else
  echo "   ✅ Git status bersih."
fi

echo ""
echo "===================================================="
echo "🎉 RELEASE GATE M9 LULUS: WEALTH OS SIAP DIRILIS!"
echo "===================================================="

