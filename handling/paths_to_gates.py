from pymongo import MongoClient
from bson.objectid import ObjectId

from pprint import pprint, pformat
import json


def get_keywords_in_KB(KB):
    """

    Retrieve documents related to keywords from cache, if cache doesnt exist creates the cache

    @return: an index with key "_id" and values the references to the related documents

    """
    query = KB["memcached"].find_one({"object": "homepageKeys"})
    if query is None:  # create the dictionary of keywords and cache
        indexing = dict()
        query = {"$or": [
            {"$and": [
                    {"chronos:hasKeyword": {"$exists": True, "$ne": []}},
                    {"chronos:group": "missions"}
            ]},
            {"$and": [
                    {"schema:about": {"$exists": True, "$ne": []}},
                    {"chronos:group": "urls"}
                ]}
            ]
        }
        projection = {"chronos:hasKeyword": True,
                      "schema:about": True,
                      "skos:prefLabel": True,
                      "schema:headline": True,
                      "schema:description": True}
        objects = KB['base'].find(query, projection)

        #pprint(objects[5])

        for o in objects:
            if "chronos:hasKeyword" in o:
                ref = "chronos:hasKeyword"
            else:
                ref = "schema:about"
            for k in o[ref]:
                doc = KB['base'].find_one({"_id": ObjectId(k["_id"])})
                if str(doc["_id"]) in indexing.keys():
                    # append
                    indexing[str(doc["_id"])]["linked"].append(str(o["_id"]))
                else:
                    # create key > value
                    indexing[str(doc["_id"])] = {
                        "pref_label": doc["skos:prefLabel"],
                        "linked": [str(o["_id"])]
                    }
        pprint(indexing)
        index = indexing
        import time
        indexing = json.dumps(indexing)
        KB["memcached"].insert({"object": "homepageKeys", "time": time.time(), "value": indexing})
    else:  # retrieve from cache
        index = json.loads(query["value"])

    sort = []
    for k, v in sorted(index.items(), key=lambda x: len(x[1]["linked"]), reverse=True):
        sort.append([k, len(index[k]["linked"]), index[k]["pref_label"]])

    return sort

def get_instruments_in_KB(KB):
    query = KB["memcached"].find_one({"object": "homepageInstruments"})

    query = KB["base"].find({"$and":
                [
                    {"chronos:group": "missions"},
                    {"chronos:hasPayload": {"$exists": True, "$ne": []}}
                ]
            })
    # db.base.find({$and: [{"chronos:hasKeyword": {"$ne": []}},{"chronos:group": "urls"}]}).pretty()
