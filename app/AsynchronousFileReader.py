"""
Simple thread based asynchronous readers for Python heavily
based on AsynchronousFileReader ( commit 3c8b9ac see
https://github.com/soxofaan/asynchronousfilereader ), but
extended to deal with JSON messages as sent by the browser to a
native application called by a webextension.

MIT License
Copyright (c) 2014 Stefaan Lippens
              2017 David Kalnischkies
"""

__version__ = '0.2.1.1'

import threading
import json
import struct
import sys
try:
    # Python 2
    from Queue import Queue
except ImportError:
    # Python 3
    from queue import Queue


class AsynchronousFileReader(threading.Thread):
    """
    Helper class to implement asynchronous reading of a file
    in a separate thread. Pushes read lines on a queue to
    be consumed in another thread.
    """

    def __init__(self, fd, queue=None, autostart=True):
        self._fd = fd
        if queue is None:
            queue = Queue()
        self.queue = queue

        threading.Thread.__init__(self)

        if autostart:
            self.start()

    def eof(self):
        """
        Check whether there is no more content to expect.
        """
        return not self.is_alive() and self.queue.empty()

    def readlines(self):
        """
        Get currently available lines.
        """
        while not self.queue.empty():
            yield self.queue.get()


class AsynchronousLineReader(AsynchronousFileReader):
    def run(self):
        """
        The body of the thread: read lines and put them on the queue.
        """
        while True:
            line = self._fd.readline()
            if not line:
                self.queue.put({'cmd': 'exit'})
                break
            self.queue.put(line)


class AsynchronousJSONReader(AsynchronousFileReader):
    def run(self):
        """
        The body of the thread: read lines and put them on the queue.
        """
        while True:
            rawLength = self._fd.read(4)
            if len(rawLength) == 0:
                self.queue.put({'cmd': 'exit'})
                break
            messageLength = struct.unpack('@I', rawLength)[0]
            message = self._fd.read(messageLength)
            self.queue.put(json.loads(message))


class AsynchronousInotifyReader(AsynchronousFileReader):
    listcalled = False

    def clearPending(self):
        self.listcalled = False

    def run(self):
        """
        The body of the thread: read lines and put them on the queue.
        """
        while True:
            line = self._fd.readline().rstrip('\n')
            if self.listcalled:
                continue
            if not line:
                self.queue.put({'cmd': 'exit'})
                break
            # avoid working on uninteresting file changes
            if not line.endswith('.js'):
                if not line.endswith('.css'):
                    continue
            self.listcalled = True
            self.queue.put({'cmd': 'list', 'inotify': line})
