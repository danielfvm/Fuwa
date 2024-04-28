# This script was taken from https://github.com/tintinweb/electron-inject
# and modified to work with this project

import requests
import time
import json
import socket
import subprocess
import logging
import websocket

logger = logging.getLogger(__name__)

class LazyWebsocket(object):
    def __init__(self, url):
        self.url = url
        self.ws = None

    def _connect(self):
        if not self.ws:
            self.ws = websocket.create_connection(self.url)
        return self.ws

    def send(self, *args, **kwargs):
        return self._connect().send(*args, **kwargs)

    def recv(self, *args, **kwargs):
        return self.ws.recv(*args, **kwargs)

    def sendrcv(self, msg):
        self.send(msg)
        return self.recv()

    def close(self):
        print("disconnected")
        self.ws.close()


class ElectronRemoteDebugger(object):
    def __init__(self, proc, host, port):
        self.proc = proc
        self.params = {'host': host, 'port': port}

    def windows(self):
        params = self.params.copy()
        params.update({'ts': int(time.time())})

        ret = []
        for w in self.requests_get("http://%(host)s:%(port)s/json/list?t=%(ts)d" % params).json():
            url = w.get("webSocketDebuggerUrl")
            if not url:
                continue
            w['ws'] = LazyWebsocket(url)
            ret.append(w)
        return ret

    def requests_get(self, url, tries=5, delay=1):
        last_exception = Exception("failed to request after %d tries."%tries)
        for _ in range(tries):
            try:
                return requests.get(url)
            except requests.exceptions.ConnectionError as ce:
                # ignore it
                last_exception = ce
            time.sleep(delay)
        raise last_exception


    def sendrcv(self, w, msg):
        return w['ws'].sendrcv(msg)

    def eval(self, w, expression):

        data = {'id': 1,
                'method': "Runtime.evaluate",
                'params': {'contextId': 1,
                           'doNotPauseOnExceptionsAndMuteConsole': False,
                           'expression': expression,
                           'generatePreview': False,
                           'includeCommandLineAPI': True,
                           'objectGroup': 'console',
                           'returnByValue': False,
                           'userGesture': True}}

        ret = json.loads(w['ws'].sendrcv(json.dumps(data)))
        if "result" not in ret:
            return ret
        if ret['result'].get('wasThrown'):
            raise Exception(ret['result']['result'])
        return ret['result']

    @classmethod
    def execute(cls, path, port=None):
        if port is None:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('', 0))
            port = sock.getsockname()[1]
            sock.close()

        cmd = "%s %s" % (path, "--remote-debugging-port=%d --remote-allow-origins=http://localhost:%d" % (port, port))
        print(cmd)
        p = subprocess.Popen(cmd, shell=True)
        time.sleep(2)
        if p.poll() is not None:
            raise Exception("Could not execute cmd (not found or already running?): %r"%cmd)

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        for _ in range(30):
            result = sock.connect_ex(('localhost', port))
            if result > 0:
                break
            time.sleep(1)

        return cls(p, "localhost", port=port)


def inject(target, content, port=None):
    timeout = time.time() + 5

    erb = ElectronRemoteDebugger.execute(target, port)

    windows_visited = set()
    while True:
        for w in (_ for _ in erb.windows() if _.get('id') not in windows_visited):
            try:
                logger.info("injecting into %s" % w.get('id'))
                logger.debug(erb.eval(w, content))

            except Exception as e:
                logger.exception(e)
            finally:
                # patch windows only once
                windows_visited.add(w.get('id'))

        if time.time() > timeout or all(w.get('id') in windows_visited for w in erb.windows()):
            break

        logger.debug("timeout not hit.")
        time.sleep(1)

    return erb
