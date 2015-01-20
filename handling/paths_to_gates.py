from pymongo import MongoClient
from bson.objectid import ObjectId

from pprint import pprint, pformat
import json
import time

from urllib.parse import quote, unquote


def get_keywords_in_KB(KB):
    """

    Retrieve documents related to keywords from cache, if cache doesnt exist creates the cache
    ------------------------------------------------------------------------------------------
    {
       <keyword _id> :
    }

    @return: an index with key "_id" and values the references to the related documents

    """
    query = KB["memcached"].find_one({"object": "homepageKeys"})
    if query is None:  # create the dictionary of keywords and cache
        indexing = dict()
        #query =
            #{"$or": [
            #{"$and": [
                    #{"chronos:hasKeyword": {"$exists": True, "$ne": []}},
                    #{"chronos:group": "missions"}
            #]},
        query = {"$and": [
                    {"schema:about": {"$exists": True, "$ne": []}},
                    {"chronos:group": "urls"}
                ]}
            #]
        #}
        projection = { # "chronos:hasKeyword": True,
                      "schema:about": True,
                      "skos:prefLabel": True,
                      "schema:headline": True,
                      "schema:description": True}
        objects = KB['webpages'].find(query, projection)

        #pprint(objects[5])

        for o in objects:
            for k in o["schema:about"]:
                doc = KB['base'].find_one({"_id": ObjectId(k["_id"])})
                print(doc["_id"])
                if str(doc["_id"]) in indexing.keys():
                    # append
                    indexing[str(doc["_id"])]["linked"].append(str(o["_id"]))
                else:
                    # create key > value
                    try:
                        q = KB["base"].find_one({"_id": ObjectId(doc["skos:exactMatch"][0]["_id"])})
                        indexing[str(doc["_id"])] = {
                            "broader": q["skos:prefLabel"],
                            "pref_label": doc["skos:prefLabel"],
                            "linked": [str(o["_id"])]
                        }
                    except KeyError:
                        print("Passed: This is a subject: " + str(doc["_id"]))
                        pass

        index = indexing
        indexing = json.dumps(indexing)
        KB["memcached"].insert({"object": "homepageKeys", "time": time.time(), "value": indexing})
    else:  # retrieve from cache
        index = json.loads(query["value"])

    sort = []
    for k, v in sorted(index.items(), key=lambda x: len(x[1]["linked"]), reverse=True):
        sort.append([k, len(index[k]["linked"]), index[k]["pref_label"], index[k]["broader"]])

    return sort


def get_instruments_in_KB(KB):
    query = KB["memcached"].find_one({"object": "homepageInstruments"})
    if query is None:
        indexing = dict()
        query = {"$and":
                    [
                        {"chronos:group": "missions"},
                        {"chronos:hasPayload": {"$exists": True, "$ne": []}}
                    ]
                }

        objects = KB['base'].find(query)

        for o in objects:
            for k in o["chronos:hasPayload"]:
                #k = quote(k)
                if k in indexing.keys():
                    # append
                    indexing[k]["missions"].append(str(o["_id"]))
                else:
                    # create key > value
                    indexing[k] = {
                        "missions": [str(o["_id"])]
                    }
        index = indexing

        indexing = json.dumps(indexing)
        KB["memcached"].insert({"object": "homepageInstruments", "time": time.time(), "value": indexing})
    else:  # retrieve from cache
        index = json.loads(query["value"])

    sort = []
    for k, v in sorted(index.items(), key=lambda x: len(x[1]["missions"]), reverse=True):
        sort.append([quote(k), len(index[k]["missions"]), k])

    return sort