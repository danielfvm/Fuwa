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

hostName = "localhost"
serverPort = 8875

logger = logging.getLogger(__name__)
keyboard = Controller()

class KeyboardServer(BaseHTTPRequestHandler):
    def do_GET(self):
        data = unquote(self.path)[1:].replace("size=56", "size=48").replace("&quality=lossless", "")

        print(">" + data + "<")

        if data.startswith("http"):
            self.send_response(200)
            # write url into chatbox and send it, on linux there was some bug that when using 
            # keyboard.type it would mix up some keys, therefore it now has an additional sleep
            if sys.platform.startswith("linux"):
                for key in data:
                    keyboard.type(key)
                    sleep(0.001)
                keyboard.type('\n')
            else:
                keyboard.type(data)
                keyboard.type('\n')
        else:
            self.send_response(200)
            with open("theme.cfg", "w+") as f:
                f.write(data)

def find_discord_on_windows():
    # C:\Users\Daniel\AppData\Local\Discord\app-1.0.9011
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

        # Start server
        webServer = HTTPServer((hostName, serverPort), KeyboardServer)
        print("Server started http://%s:%s" % (hostName, serverPort))
        server_thread = Thread(target=webServer.serve_forever, args=())
        server_thread.start()

        # Wait until discord stops
        while proc.poll() is None:
            sleep(1)

    except KeyboardInterrupt:
        pass

    webServer.shutdown()
