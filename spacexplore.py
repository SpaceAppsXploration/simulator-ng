from sockjs.tornado import SockJSConnection
import tornado.httpclient


class RESTandCache(object):
    """
        Class for Tornado to Async-Call the REST endpoints:
        def get(self, what): client instantiation and fetch
        def on_response(self, response): callback 
    """
    def __init__(self, what):
        self.urls = { 'get_targets': 'http://www.spacexplore.it:80/api/targets/',
                      'get_physics': 'http://www.spacexplore.it:80/api/physics/planets/'
                    }
        self.what = what

    @tornado.web.asynchronous
    def _get(self, what):
        url = self.urls[what]
        #query = self.get_argument('q')
        client = tornado.httpclient.AsyncHTTPClient()
        client.fetch(url, self.on_response)
                
    def _on_response(self, response):
        if response.error:
            print("Error:", response.error)
            return
        else:
            return json.loads(response.body.decode("utf-8"))