#!/bin/bash

pyinstaller main.py -n fuwa-discord --noconfirm --onefile --add-data "./script.js:."
