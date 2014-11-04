import tornado.web
import tornado.httpclient
import tornado.gen
from tornado import escape
import json

from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
from datetime import datetime
from pprint import pprint, pformat

from appdata.missions import missions


def get_hashed_password(plain_text_password):
    # Hash a password for the first time
    #   (Using bcrypt, the salt is saved into the hash itself)
    return bcrypt.hashpw(str.encode(plain_text_password), bcrypt.gensalt(12))


def check_password(plain_text_password, hashed_password):
    # Check hased password. Useing bcrypt, the salt is saved into the hash itself
    if bcrypt.hashpw(str.encode(plain_text_password), hashed_password) == hashed_password:
        return True
    return False

client = MongoClient('localhost', 27017)
USERS = client.users
KB = client.KB


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
            targets = [t for t in targets if t['use_in_sim'] is True]
            payloads = [p for p in bus_payloads if p['category'] == 'payload']
            bus_comps_unordered = [b for b in bus_payloads if b['category'] == 'bus']

            from operator import itemgetter
            bus_comps = sorted(bus_comps_unordered, key=itemgetter('pbtype'))
            bus_types = [c for c in comps if c['category'] == 'bus']

            return self.render('../static/index.html', targets=targets, missions=missions, payloads=payloads,
                               bus_comps=bus_comps, bus_types=bus_types)


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("chronos")


class LoggedHandler(BaseHandler):
    """
    Authenticated Users
    """
    @tornado.web.authenticated
    def get(self):
        name = tornado.escape.xhtml_escape(self.current_user)
        self.render("home.html", username=name)
        return


class TaxonomyHandler(BaseHandler):
    """
    Authenticated Users
    """
    @tornado.web.authenticated
    def get(self, id_=None):
        objects = dict()
        showing = "divisions"
        back = None
        hierarchy = {
            "divisions": {"broader": None, "narrower": "subjects"},
            "subjects": {"broader": "divisions", "narrower": "keywords"},
            "keywords": {"broader": "subjects", "narrower": None}
        }
        if id_ is None:
            # show all divisions
            query = {"chronos:group": "divisions"}
            objects = KB['base'].find(query).sort("skos:prefLabel")
        elif self.get_argument("showing", default=None) == 'subjects':
            showing = "subjects"  # show subjects of division id_
            query = {"_id": ObjectId(id_)}
            projection = {"skos:narrower": True}
            objects = KB['base'].find_one(query, projection)  # find the division object to find narrower subjects
            objects = objects['skos:narrower']
        elif self.get_argument("showing", default=None) == 'keywords':
            showing = "keywords" # show keywords of subject id_
            obj = KB['base'].find_one({"_id": ObjectId(id_)})  # find the single subject's document
            query = {"skos:inScheme._id": obj["_id"]}
            objects = KB['base'].find(query).sort("skos:prefLabel")  # find all the keywords in the subject's scheme

            back = KB['base'].find_one({"_id": ObjectId(obj["skos:hasTopConcept"]["_id"])})
                                                                    # find the broader division for the back button
            back = back["skos:broader"]["_id"]


        surf = hierarchy[showing]
        self.render("taxonomy.html",
                    objects=objects,
                    showing=showing,
                    surf=surf,
                    id_=id_,
                    back=back)
        return


class DocsHandler(BaseHandler):
    """
    Authenticated Users
    """
    @tornado.web.authenticated
    def get(self, id_):
        print(id_)
        objects = dict()
        length = -1
        showing = None
        back = None
        kwd = None
        if self.get_argument('type', default=None) is None:
            self.redirect("/home/taxonomy/")
            return
        else:
            if self.get_argument('type') == 'pedia':
                showing = "pedia"
                kwd = ObjectId(id_)
                query = {"$and": [
                    {"skos:narrowMatch": {"$elemMatch": {"_id": kwd}}},
                    {"skos:relatedMatch": {"$elemMatch": {"_id": kwd}}}
                    ]
                }
                projection = {}
                objects = KB['base'].find(query, projection).sort("@id")
                objects = objects
                length = objects.count()
            elif self.get_argument('type') == 'urls':
                showing = "urls"
                query = {"$and": [{"schema:about": {"$elemMatch": {"_id": ObjectId(id_)}}}, {"chronos:group": "urls"}]}
                objects = KB['urls'].find(query).sort("@id")
                length = objects.count()
            elif self.get_argument('type') == 'missions':
                showing = "missions"
                query = {"$and": [{"schema:about": {"$elemMatch": {"_id": ObjectId(id_)}}}, {"chronos:group": "missions"}]}
                objects = KB['base'].find(query).sort("@id")
                length = objects.count()

            print("kwd: " + str(kwd))
            back = KB['base'].find_one({"_id": kwd})
            pprint(back)
            if type(back["skos:inScheme"]) is list:
                back = back["skos:inScheme"][0]["_id"]
            else:
                back = back["skos:inScheme"]["_id"]

        self.render("docs.html", documents=objects,
                    length=length,
                    showing=showing,
                    back=back)


class MissionsHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self, id_=None):
        if id_ is not None:
            query = {"_id": ObjectId(id_)}
            projection = {"_id": False}
            obj = KB['base'].find_one(query, projection)
            pref_label = obj["skos:prefLabel"]
            obj = pformat(obj)
            return self.render("missions.html", document=obj, pref_label=pref_label, id_=id_)

        objects = dict()
        query = {"chronos:group": "missions"}
        objects = KB['base'].find(query).sort("skos:prefLabel")

        self.render("missions.html", documents=objects, id_=None, typed='mission')


class WebDocsHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self, id_=None):
        if id_ is not None:
            query = {"_id": ObjectId(id_)}
            projection = {"_id": False}
            obj = KB['base'].find_one(query, projection)
            pref_label = obj["schema:headline"]["@value"]
            obj = pformat(obj)
            return self.render("web.html", document=obj, pref_label=pref_label, id_=id_)

        objects = dict()
        query = {"chronos:group": "urls"}
        objects = KB['base'].find(query).sort("schema:provider._id").limit(25)

        self.render("web.html", documents=objects, id_=None, typed='urls')


class LoginHandler(BaseHandler):
    def get(self):
        if self.get_argument("err", default=None):
            self.render('login.html', errors=self.get_argument("err"))
            return
        self.render('login.html', errors=None)

    def post(self):
        user = USERS.users.find_one({"name": self.get_argument("name")})
        print(user)
        if user is not None:
            if check_password(self.get_argument("pwd"), user['password']):
                self.set_secure_cookie("chronos", self.get_argument("name"))
                self.redirect("/home/")
                return
            self.redirect('/login?err=pwd')
            return
        self.redirect('/login?err=name')


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("chronos")
        self.redirect(self.get_argument("next", "/login"))


class DataCloud(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        pass



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