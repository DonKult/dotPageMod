#!/usr/bin/env python
import json
import time
import struct
import sys
import os
import subprocess
from glob import glob
from AsynchronousFileReader import AsynchronousJSONReader, AsynchronousInotifyReader
try:
    # Python 2
    from Queue import Queue
except ImportError:
    # Python 3
    from queue import Queue


# Encode a message for transmission, given its content.
def encodeMessage(messageContent):
    encodedContent = json.dumps(messageContent)
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}


# Send an encoded message to stdout
def sendMessage(encodedMessage):
    sys.stdout.write(encodedMessage['length'])
    sys.stdout.write(encodedMessage['content'])
    sys.stdout.flush()


queue = Queue()
browser = AsynchronousJSONReader(sys.stdin, queue)
inotify_process = None
inotify_path = None
inotify = None
while True:
    r = queue.get()
    if r['cmd'] == 'list':
        if inotify and 'inotify' in r:
            time.sleep(0.1)
            inotify.clearPending()
        results = []
        if 'path' in r and inotify_path != r['path']:
            inotify_path = r['path']
            if inotify:
                inotify_process.terminate()
                inotify = None
        for filename in glob(inotify_path + '/*/*/*'):
            if filename.endswith('.js') or filename.endswith('.css'):
                key = filename.split('/')[-3:]
                results.append({
                    'collection': key[0],
                    'hostname': key[1],
                    'filename': key[2],
                    'lastmod': os.stat(filename).st_mtime,
                })
        sendMessage(encodeMessage({
            'cmd': 'listresult',
            'results': results,
        }))
        if not inotify:
            inotify_process = subprocess.Popen(['inotifywait', '-qrme', 'create,move,modify,delete',
                '--exclude', '^.*(\.sw[opx]|~|[0-9]+)$',  # ignore vim swap files, backups and inodes
                inotify_path], stdout=subprocess.PIPE)
            inotify = AsynchronousInotifyReader(inotify_process.stdout, queue)
    elif r['cmd'] == 'cat':
        filename = os.path.join(r['path'], r['collection'], r['hostname'], r['filename'])
        data = ''
        with open(filename, 'r') as myfile:
            data = myfile.read()
        sendMessage(encodeMessage({
            'cmd': 'catresult',
            'collection': r['collection'],
            'hostname': r['hostname'],
            'filename': r['filename'],
            'lastmod': os.stat(filename).st_mtime,
            'filecontent': data,
        }))
    # instead of trying to figure out if all cats are done in an async fashion,
    # we let the app send an explicit done last
    elif r['cmd'] == 'done?':
        sendMessage(encodeMessage({'cmd': 'doneresult'}))
    elif r['cmd'] == 'exit':
        if inotify:
            inotify_process.terminate()
        sys.exit(0)
    # TODO USER: You might have different preferences regarding an editor
    elif r['cmd'] == 'openeditor':
        subprocess.Popen(["x-terminal-emulator", "-e", "sensible-editor", r['path']])
    queue.task_done()
