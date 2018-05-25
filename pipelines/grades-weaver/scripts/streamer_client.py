#! /usr/bin/env python

import sys
import time
import json
import socket
import threading

try:
    import weaver.client as client
except ImportError:
    import client

global eventTime
data = []
eventTime = 0
eventCount = 0
eventInterval = 0
finished = False

def addVertex(weaver, vertex, state):
    try:
        weaver.create_node(handle=vertex)
        weaver.set_node_property(node=vertex, key='state', value=state)
    except:
        pass


def addEdge(weaver, sourceVertex, targetVertex, state):
    edgeName = sourceVertex + "-" + targetVertex
    try:
        weaver.create_edge(handle=edgeName, node1=sourceVertex, node2=targetVertex)
        weaver.set_edge_property(node=sourceVertex, edge=edgeName, key='state', value=state)
    except:
        pass


def removeVertex(weaver, vertex):
    try:
        weaver.delete_node(vertex)
    except:
        pass


def removeEdge(weaver, sourceVertex, targetVertex):
    edgeName = sourceVertex + "-" + targetVertex
    try:
        weaver.delete_edge(edgeName)
    except:
        pass


def updateVertex(weaver, vertex, state):
    try:
        weaver.set_node_property(node=vertex, key='state', value=state)
    except:
        pass


def updateEdge(weaver, sourceVertex, targetVertex, state):
    edgeName = sourceVertex + "-" + targetVertex
    try:
        weaver.set_edge_property(node=sourceVertex, edge=edgeName, key='state', value=state)
    except:
        pass

def logCount():
    global eventTime
    global eventInterval

    if not finished:
        threading.Timer(1.0, logCount).start()
    data.append((eventTime, eventInterval))

    eventInterval = 0
    eventTime += 1

if __name__ == '__main__':
    weaver = client.Client('127.0.0.1', 2002)

    host = '0.0.0.0'
    port = int(sys.argv[1])
    aggregation = int(sys.argv[2])

    print('waiting for connection...')

    mySocket = socket.socket()
    mySocket.bind((host, port))
    mySocket.listen(1)

    conn, addr = mySocket.accept()
    print('Connection from: ' + str(addr))

    logCount()

    f = conn.makefile()

    for line in f:
        event = json.loads(line)

        try:
            if (eventCount % aggregation == 0):
                weaver.begin_tx()

            if (event['command'] == 'CREATE_VERTEX'):
                addVertex(weaver, str(event['targetVertex']), json.dumps(event['payload']))
            elif (event['command'] == 'CREATE_EDGE'):
                addEdge(weaver, str(event['sourceVertex']), str(event['targetVertex']), json.dumps(event['payload']))
            elif (event['command'] == 'UPDATE_EDGE'):
                updateEdge(weaver, str(event['sourceVertex']), str(event['targetVertex']), json.dumps(event['payload']))
            elif (event['command'] == 'UPDATE_VERTEX'):
                updateVertex(weaver, str(event['targetVertex']), json.dumps(event['payload']))
            elif (event['command'] == 'REMOVE_EDGE'):
                removeEdge(weaver, str(event['sourceVertex']), str(event['targetVertex']))
            elif (event['command'] == 'REMOVE_VERTEX'):
                removeVertex(weaver, str(event['targetVertex']))

            if (eventCount % aggregation == (aggregation - 1)):
                weaver.end_tx()
        except:
            pass

        eventCount += 1
        eventInterval += 1

    finished = True
    data.append((eventTime, eventInterval))

    f.close()
    conn.close()

    print(str(data))

    with open('results.txt', 'w') as outfile:
        for entry in data:
            outfile.write(str(entry[0]) + '\t' + str(entry[1]) + '\n')
