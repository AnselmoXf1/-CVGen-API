@echo off
echo Iniciando Frontend CVGen...
echo.
echo Frontend estará disponível em: http://localhost:8080
echo API Backend em: http://localhost:3000
echo.

cd frontend
start http://localhost:8080
npx live-server --port=8080 --open=/index.html