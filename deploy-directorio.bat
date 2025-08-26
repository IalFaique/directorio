@echo off
REM ==== Script de despliegue para directoriofaique ====

:: Preguntar mensaje de commit
set /p commitmsg="Escribe el mensaje de commit: "

echo ===========================================
echo Guardando cambios en Git...
echo ===========================================

git add .
git commit -m "%commitmsg%"
git push

echo ===========================================
echo Construyendo y desplegando a GitHub Pages...
echo ===========================================

npm run deploy

echo ===========================================
echo ✅ Proceso terminado. Verifica tu sitio en:
echo https://ialfaique.github.io/directorio/
echo ===========================================

pause
