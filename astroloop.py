#!/usr/bin/env python
import os.path
import tornado.ioloop as ioloop
import tornado.web as web

from sockjs.tornado import SockJSRouter

from socketing.connections import *
from handling.handlers import *

PATH = os.path.dirname(__file__)

settings = {
    "template_path": os.path.join(PATH, "templates"),
    "static_path": os.path.join(PATH, 'static'),
    "cookie_secret": "4f4s68sdf7g16sdf6_a7sdf9g94dj",
    "login_url": "/login",
    "xsrf_cookies": True,
}

if __name__ == '__main__':
    import logging
    logging.getLogger().setLevel(logging.DEBUG)

    SocketRouter = SockJSRouter(SocketConnection, '/connect')

    app = web.Application(
        [(r"/database", Database),
         (r"/contact", SendFeedback),
         (r"/cloud", DataCloud),
         (r"/get/instrument/in/kb/(?P<slug>[0-9a-zA-z\+\-\,\:\%\/]+)/", AccessFromInstrument),
         (r"/get/keyword/in/kb/(?P<id_>[0-9a-fA-F]+)/", AccessFromKeywords),
         (r"/get/(?P<id_>[0-9a-fA-F]+)/", GetTest),
         (r"/login", LoginHandler),
         (r"/logout/", LogoutHandler),
         (r'/home/missions/data/(?P<id_>[0-9a-fA-F]+)/', MissionsHandler),
         (r"/home/missions/", MissionsHandler),
         (r'/home/web/data/(?P<id_>[0-9a-fA-F]+)/', WebDocsHandler),
         (r"/home/web/", WebDocsHandler),
         (r"/home/docs/(?P<id_>[0-9a-fA-F]+)/", DocsHandler),
         (r"/home/taxonomy/(?P<id_>[0-9a-fA-F]+)/", TaxonomyHandler),
         (r"/home/taxonomy/$", TaxonomyHandler),
         (r"/home/crowdsourced/(?P<id_>[0-9a-fA-F]+)/", CrowdSourced),
         (r"/home/graphviz/", GraphViz),
         (r"/home/", LoggedHandler),
         (r"/$", IndexHandler),
         (r"/pointer_test", TestHandler)] + \
        SocketRouter.urls,
        (r"/static/(.*)", web.StaticFileHandler, {"path": settings['static_path']}),
        **settings
    )
    port = 3001
    app.listen(port)
    print("Tornado " + tornado.version + " Running at port " + str(port))
    ioloop.IOLoop.instance().start()

