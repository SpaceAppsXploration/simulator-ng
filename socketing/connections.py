from sockjs.tornado import SockJSConnection
import tornado.httpclient

import json
from appdata.results import ratings
from appdata.results import levels


class SocketConnection(SockJSConnection):
    """
        Receiving and Transmitting via sockets.
        def send_error(self, message, error_type=None): Error handling
        def send_message(self, message, data_type): Message receiver
        def on_open(self, request): when client open socket
        def on_message(self, msg): when client send a message
    """

    clients = set()
    SOCK_MSGS = {'get_target': 'http://www.spacexplore.it:80/api/targets/',
                 'get_physics': 'http://www.spacexplore.it:80/api/physics/planets/',
                 'destination': 'object',
                 'destination-mission': 'http://www.spacexplore.it:80/simulation/',
                 'set-payload': 'http://www.spacexplore.it:80/simulation/',
                 'set-bus': 'http://www.spacexplore.it:80/simulation/',
                 'get_ratings': 'calculate',
                 'get_missions': 'http://www.spacexplore.it:80/api/missions/by/target/'
    }

    def send_error(self, message, error_type=None):
        """
        Standard format for all errors
        """
        return self.send(json.dumps({
            'data_type': 'error' if not error_type else '%s_error' % error_type,
            'data': {
                'message': message
            }
        }))

    def send_message(self, message, data_type):
        """
        Standard format for all messages
        """
        return self.send(json.dumps({
            'data_type': data_type,
            'data': message,
        }))

    def get(self, msg):
        url = self.SOCK_MSGS[msg['query']]
        q = str(msg['object'])
        # print(url+q)
        #query = self.get_argument('q')
        client = tornado.httpclient.HTTPClient()
        response = client.fetch(url + q)
        client.close()
        return json.loads(response.body.decode("utf-8"))

    def on_open(self, request):
        """
        Request the client to authenticate and add them to client pool.
        """
        token = request.headers
        # self.send_message({ 'shake_hand': 200 }, 'shake_hand')
        self.clients.add(self)

    def on_message(self, msg):
        print(msg)
        msg = json.loads(msg)
        if msg['query'] in self.SOCK_MSGS.keys():
            # print(msg)
            if msg['query'] == 'destination':
                # echo variable received via ack
                self.send_message(msg['object'], msg['query'])
                return
            elif msg['query'] == 'destination-mission':
                response = self.get(msg)
                self.send_message(response, msg['query'])
                return
            elif msg['query'] == 'get_ratings':
                # calculate ratings
                params = msg['object']
                #print(params) # [destination, mission, [payloads], [bus]]
                int_index = int(round(ratings[params[0]][0] * .6 + ratings[params[1]][0] * .4))

                pl_cost = 0
                for pl in params[2]:
                    pl_cost += ratings[pl][1]

                pl_cost /= len(params[2])

                bus_cost = 0
                for bus in params[3]:
                    bus_cost += ratings[bus][1]

                bus_cost /= len(params[3])

                cost_index = int(round(ratings[params[0]][1] * .5 + pl_cost * .2 + bus_cost * .3))

                risk_index = int(round(ratings[params[0]][2] * .5 + ratings[params[1]][2] * .5))

                print(int_index, cost_index, risk_index)

                interest = {"level": int_index, "comment": levels['interest'][int_index]}
                cost = {"level": 5 - cost_index, "comment": levels['cost'][cost_index]}
                risk = {"level": risk_index, "comment": levels['risk'][risk_index]}

                response = {"interest": interest, "cost": cost, "risk": risk}
                self.send_message(response, msg['query'])
                return

            elif msg['query'] == 'get_missions':
                # query REST endpoint and return json
                #print(msg)
                response = self.get(msg)
                self.send_message(response, msg['query'])
                return

            response = self.get(msg)
            self.send_message(response, msg['query'])
            return

        else:
            # echo only server
            self.send_message({'response': 200, 'msg': str(msg)}, 'wrong query')

    def on_close(self):
        """
        Remove client from pool. Unlike Socket.IO connections are not
        re-used on e.g. browser refresh.
        """
        self.clients.remove(self)
        return super(SocketConnection, self).on_close()
