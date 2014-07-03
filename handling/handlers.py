import tornado.web
import tornado.httpclient
import tornado.gen
import json

from appdata.missions import missions


class IndexHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        client = tornado.httpclient.AsyncHTTPClient()
        targets_url = 'http://www.spacexplore.it:80/api/targets/'
        payload_url = 'http://www.spacexplore.it:80/api/components/'
        comps_types_url = 'http://www.spacexplore.it:80/api/components/types/'
        response = yield dict(targets=client.fetch(targets_url),
                              bus_payload=client.fetch(payload_url),
                              comps_types=client.fetch(comps_types_url))

        if response['targets'].error or response['bus_payload'].error:
            print("Error:", response.error)
            return
        else:
            targets = json.loads(response['targets'].body.decode('UTF-8'))
            bus_payloads = json.loads(response['bus_payload'].body.decode('UTF-8'))
            comps = json.loads(response['comps_types'].body.decode('UTF-8'))
            # print(bus_payloads)
            targets = [t for t in targets if t['use_in_sim'] == True]
            payloads = [p for p in bus_payloads if p['category'] == 'payload']
            bus_comps_unordered = [b for b in bus_payloads if b['category'] == 'bus']

            from operator import itemgetter
            bus_comps = sorted(bus_comps_unordered, key=itemgetter('pbtype'))
            bus_types = [c for c in comps if c['category'] == 'bus']

            return self.render('../static/index.html', targets=targets, missions=missions, payloads=payloads,
                               bus_comps=bus_comps, bus_types=bus_types)


class SendFeedback(tornado.web.RequestHandler):
    def post(self):
        req = self.request.body.decode('utf-8')
        print(json.loads(req))

        import pickle

        with open('handling/feedback.save', 'a') as f:
            f.write(req+' \n')


class TestHandler(tornado.web.RequestHandler):
    def get(self):
        return self.render('cursor-test.html')