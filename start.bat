@echo off
call forever stop server-bot.js
forever start server-bot.js
forever list

:: start.bat by MLPVC-BOT
:: https://github.com/ponydevs/MLPVC-BOT