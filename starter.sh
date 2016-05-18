#!/bin/sh

if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then
	export PATH=/usr/local/bin:$PATH
	cd /www/GUI/blender/remote/
	forever start -l blender.log --append -o blenderOut.log -e blenderError.log server.js >> /home/deploy/.forever/blenderRestart.log 2>&1
fi