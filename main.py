#!/bin/python

from time import sleep
from injector import inject
from distutils.spawn import find_executable
from pynput.keyboard import Controller
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import unquote
from threading import Thread

import subprocess
import logging
import psutil
import sys
import os

logger = logging.getLogger(__name__)
keyboard = Controller()

def find_discord_on_windows():
    # C:\Users\USERNAME\AppData\Local\Discord\app-1.0.9011
    installation_folder = "C:/Users/%s/AppData/Local/Discord/" % os.getlogin()

    # No discord installation found
    if not os.path.isdir(installation_folder):
        return None

    # search app folder
    folders = os.listdir(installation_folder)
    for folder in folders:
        if folder.startswith("app"):
            return installation_folder + folder + "/Discord.exe"

    # No app folder found
    return None

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    print(find_executable('discord.exe'))

    # either set path to discord.exe automaticly or set it by argument
    if len(sys.argv) > 1:
        target = sys.argv[1]
    else:
        target = find_executable('discord') or find_executable('discord.exe') or find_discord_on_windows()

    # Check if file exists
    if not os.path.isfile(target):
        print('Could not find discord program, please pass the path to the executable.')
        exit(0)
    else:
        print('Discord executable found at:', target)

    # check if discord is already running
    running = 'Discord' in (p.name() for p in psutil.process_iter())

    if running is True:
        subprocess.Popen(target, shell=True)
        exit(0)

    # start discord with injecting script
    try:
        with open('./script.js', "r") as file:
            content = file.read()

            theme_selected = ''
            try:
                with open("theme.cfg", "r") as f:
                    theme_selected = f.read()
            except OSError:
                print("Failed to open theme.cfg file")

            proc = inject(target, content.replace("THEME", "THEME='" + theme_selected + "'")).proc

        # Wait until discord stops
        while proc.poll() is None:
            sleep(1)

    except KeyboardInterrupt:
        pass
