__author__ = 'lorenzo'

from pymongo import MongoClient

import bcrypt
from datetime import datetime


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


if not USERS.users.find_one():
    hashed_password = get_hashed_password('prova')
    USERS.users.insert(
        {
            "name": "prova",
            "password": hashed_password,
            "joined": datetime.utcnow().strftime("%d/%m/%y %H:%M"),
            "updated": datetime.utcnow().strftime("%d/%m/%y %H:%M")
        }
    )

