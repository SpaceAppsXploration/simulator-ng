#!/usr/bin/env python
import os.path
import tornado.ioloop as ioloop
import tornado.web as web

from sockjs.tornado import SockJSRouter

from socketing.connections import *
from handling.handlers import *

PATH = os.path.dirname(__file__)

settings = {
    'template_path': os.path.join(PATH, "templates"),
    'static_path': os.path.join(PATH, 'static')
}

if __name__ == '__main__':
    import logging

    logging.getLogger().setLevel(logging.DEBUG)

    SocketRouter = SockJSRouter(SocketConnection, '/connect')

    app = tornado.web.Application(
        [(r"/", IndexHandler),
         (r"/contact", SendFeedback),
         (r"/pointer_test", TestHandler)] + \
        SocketRouter.urls,
        (r"/static/(.*)", web.StaticFileHandler, {"path": settings['static_path']}),
        **settings
    )
    app.listen(8080)
    ioloop.IOLoop.instance().start()

