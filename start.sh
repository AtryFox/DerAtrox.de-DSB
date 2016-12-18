#! /bin/bash
cd $(dirname $(readlink -f ${BASH_SOURCE[0]}))

git reset HEAD --hard
git pull

chmod +x ./start.sh

dir="$(basename $PWD)"

forever list | grep $dir && forever stop $dir
forever start --uid $dir -a discord-bot.js
forever list

# start.sh by MLPVC-BOT
# https://github.com/ponydevs/MLPVC-BOT