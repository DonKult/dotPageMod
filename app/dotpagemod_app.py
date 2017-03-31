#!/usr/bin/env python
import json
import struct
import sys
import os
from glob import glob


# Read a message from stdin and decode it.
def getMessage():
    rawLength = sys.stdin.read(4)
    if len(rawLength) == 0:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.read(messageLength)
    return json.loads(message)


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


while True:
    r = getMessage()
    if r['cmd'] == 'list':
        results = []
        for filename in glob(r['path'] + '/*/*/*'):
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
