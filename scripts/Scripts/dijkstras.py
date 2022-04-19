# This is free and unencumbered software released into the public domain.
#
# Anyone is free to copy, modify, publish, use, compile, sell, or
# distribute this software, either in source code form or as a compiled
# binary, for any purpose, commercial or non-commercial, and by any
# means.
#
# In jurisdictions that recognize copyright laws, the author or authors
# of this software dedicate any and all copyright interest in the
# software to the public domain. We make this dedication for the benefit
# of the public at large and to the detriment of our heirs and
# successors. We intend this dedication to be an overt act of
# relinquishment in perpetuity of all present and future rights to this
# software under copyright law.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
# OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
# ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.
#
# For more information, please refer to <http://unlicense.org/>

# Priority dictionary using binary heaps
# David Eppstein, UC Irvine, 8 Mar 2002
# https://gist.github.com/anonymous/4435950
# http://code.activestate.com/recipes/117228/

from __future__ import generators


class priorityDictionary(dict):
    def __init__(self):
        '''Initialize priorityDictionary by creating binary heap of pairs (value,key).
Note that changing or removing a dict entry will not remove the old pair from the heap
until it is found by smallest() or until the heap is rebuilt.'''
        self.__heap = []
        dict.__init__(self)

    def smallest(self):
        '''Find smallest item after removing deleted items from front of heap.'''
        if len(self) == 0:
            raise IndexError("smallest of empty priorityDictionary")
        heap = self.__heap
        while heap[0][1] not in self or self[heap[0][1]] != heap[0][0]:
            lastItem = heap.pop()
            insertionPoint = 0
            while 1:
                smallChild = 2*insertionPoint+1
                if smallChild+1 < len(heap) and heap[smallChild] > heap[smallChild+1]:
                    smallChild += 1
                if smallChild >= len(heap) or lastItem <= heap[smallChild]:
                    heap[insertionPoint] = lastItem
                    break
                heap[insertionPoint] = heap[smallChild]
                insertionPoint = smallChild
        return heap[0][1]

    def __iter__(self):
        '''Create destructive sorted iterator of priorityDictionary.'''
        def iterfn():
            while len(self) > 0:
                x = self.smallest()
                yield x
                del self[x]
        return iterfn()

    def __setitem__(self, key, val):
        '''Change value stored in dictionary and add corresponding pair to heap.
Rebuilds the heap if the number of deleted items gets large, to avoid memory leakage.'''
        dict.__setitem__(self, key, val)
        heap = self.__heap
        if len(heap) > 2 * len(self):
            self.__heap = [(v, k) for k, v in self.iteritems()]
            self.__heap.sort()  # builtin sort probably faster than O(n)-time heapify
        else:
            newPair = (val, key)
            insertionPoint = len(heap)
            heap.append(None)
            while insertionPoint > 0 and newPair < heap[(insertionPoint-1)//2]:
                heap[insertionPoint] = heap[(insertionPoint-1)//2]
                insertionPoint = (insertionPoint-1)//2
            heap[insertionPoint] = newPair

    def setdefault(self, key, val):
        '''Reimplement setdefault to pass through our customized __setitem__.'''
        if key not in self:
            self[key] = val
        return self[key]


'''
Dijkstra's algorithm for shortest paths
Adapted from:
David Eppstein, UC Irvine, 4 April 2002
https://www.ics.uci.edu/~eppstein/161/python/dijkstra.py
'''

def dijkstra_path_predecessors(G, start, end=None):
    """
    Find shortest paths from the start vertex to all vertices nearer than or equal to the end.

    Expects a graph G in the form:
    {keyid : {edge endpoint id: weight }}
    example:
    G = {
        '64': {'66':1, '65':1},
        '66': {'64':1},
        '94': {'92':1, '93':1},
        '98': {}}

    G can also be LineNode.graph

    Dijkstra's algorithm is only guaranteed to work correctly when all edge lengths are positive.
    This code does not verify this property for all edges (only the edges examined until the end
    vertex is reached), but will correctly compute shortest paths even for some graphs with negative
    edges, and will raise an exception if it discovers that a negative edge has caused it to make a mistake.
    """

    D = {}    # dictionary of final distances
    P = {}    # dictionary of predecessors
    Q = priorityDictionary()    # estimated distances of non-final vertices
    Q[start] = 0

    for v in Q:
        D[v] = Q[v]
        if v == end:
            break
        for w in G[v]:
            vwLength = D[v] + G[v][w]
            if w in D:
                if vwLength < D[w]:
                    raise ValueError("Dijkstra: found better path to already-final vertex")
            elif w not in Q or vwLength < Q[w]:
                Q[w] = vwLength
                P[w] = v

    return (D, P)


def shortest_path(G, start, end):
    """
    Find a single shortest path from the given start vertex to the given end vertex.
    The input has the same conventions as dijkstra_path_predecessors().
    The output is a list of the vertices in order along the shortest path.
    """

    D, P = dijkstra_path_predecessors(G, start, end)
    Path = []
    while 1:
        Path.append(end)
        if end == start:
            break
        end = P[end]
    Path.reverse()
    return Path


class LineNode(object):
    '''Graph and utilites for dijkstras and shortest_path'''
    graph = {}

    def __init__(self, oid, start_point, end_point, line_length=None):
        self.id = str(oid)
        LineNode.graph[self.id] = {}
        self.start = start_point
        self.end = end_point
        self.line_length = line_length

    def is_undirected_connection(self, start_point, end_point):
        return start_point.equals(self.end) or\
                end_point.equals(self.start) or\
                start_point.equals(self.start) or\
                end_point.equals(self.end)

    def is_directed_connection(self, other_point, this_point):
        return other_point.equals(this_point)

    def add_edge(self, id, weight=1):
        LineNode.graph[self.id][id] = weight


def get_predecessor_ids(last_id, first_id, predecessors):
    ids = [last_id]
    if first_id not in predecessors.values():
        return ids

    current_id = last_id
    while current_id is not first_id:
        current_id = predecessors[current_id]
        ids.append(current_id)

    return ids
