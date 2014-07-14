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


class Database(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        client = tornado.httpclient.AsyncHTTPClient()
        data_url = 'http://www.spacexplore.it:80/api/scidata/by/target/'

        futures = []
        for i in range(1, 19):
            url = data_url+str(i)
            futures.append(client.fetch(url))

        responses = yield futures

        results = []
        for i in responses:
            if i.body != b'[]':
                i = json.loads(i.body.decode('UTF-8'))
                results += i

        #print(results)
        #dump = json.dumps(results)

        graph = {"nodes": [], "edges": []}
        # arrange results for visualization
        components_ = list()
        components_link = list()

        for datum in results:
            if datum['data_scope'] == 4:
                graph['nodes'].append({'id': datum['id'], 'header': datum['header'], 'type': 'field'})
            else:
                graph['nodes'].append({'id': datum['id'], 'header': datum['header'], 'type': 'datum'})
                related_to = datum['related_to']
                if related_to != None:
                    graph['edges'].append({'source': datum['id'], 'target': related_to['id'], 'value': 1.25})
            mission = datum['mission']
            if mission != 'null':
                graph['nodes'].append({'id': mission['id'], 'header': mission['codename'], 'type': 'mission'})
                graph['edges'].append({'source': datum['id'], 'target': mission['id'], 'value': 1})
            component = datum['component']
            if len(component) > 1:
                for c in component:
                    components_.append({'id': c['id'], 'header': c['slug'], 'type': 'component'})
                    components_link.append({'source': datum['id'], 'target': c['id'], 'value': 1.50})
            else:
                components_.append({'id': component[0]['id'], 'header': component[0]['slug'], 'type': 'component'})
                components_link.append({'source': datum['id'], 'target': component[0]['id'], 'value': 1.50})

        graph['nodes'] += components_
        graph['edges'] += components_link

        dump = json.dumps(graph)
        print(dump)

        return self.write(dump)





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