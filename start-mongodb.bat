@echo off
echo Iniciando MongoDB local...
echo.

REM Criar diretório de dados se não existir
if not exist "mongodb-data" mkdir mongodb-data

REM Tentar iniciar MongoDB
echo Tentando iniciar MongoDB...
mongod --dbpath mongodb-data --port 27017

pause