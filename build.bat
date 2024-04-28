@echo off

pyinstaller main.py -n fuwa-discord --noconsole --noconfirm --onefile --add-data "./script.js;."
