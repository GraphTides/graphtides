import distributions from '../../src/distributions';
import UserInterface from '../../src/UserInterface';
import { Vertex, Edge, Graph, EventType } from '../../src/Graph';

const Random: any = require( 'random-js');

const SortedSet = require('redis-sorted-set');
const random = new Random(Random.engines.mt19937().seed(Math.random()));
const chance = new (<any> require('chance'))();

random.distribution = function<T>(distribution: Map<T, number>): T {
    let sum = 0;
    const dist : Map<number, T> = new Map();
    for (const [k, p] of distribution) {
        if (p > 0) {
            dist.set(sum + p, k);
        }
        sum += p;
    }

    const r = random.real(0, sum);
    for (const [p, e] of dist) {
        if (r <= p) {
            return e;
        }
    }

    return <T> dist.get(0);
};

module.exports = <UserInterface> {
    bootstrapGlobalContext() {
        const globalContext : any = {
            vertexCount: 0,
            incVertexCount: (i: number) => {
                globalContext.vertexCount += i;
                globalContext.vertexZipf = distributions.zipf(.8, globalContext.vertexCount);
            },
            degreeIndex: new SortedSet()
        };

        globalContext.incVertexCount(0);
        return globalContext;
    },

    bootstrapGraph(graph: Graph, globalContext: any) {
        const generator = require('../../src/randomgraph/BarabasiAlbert');

        const n = 10000;
        const m0 = 250;
        const M = 50;

        return generator(graph, n, m0, M);
    },

    nextEventType(globalContext: any) {
        const distribution = new Map();
        distribution.set(EventType.CREATE_VERTEX, 0.1);
        distribution.set(EventType.REMOVE_VERTEX, 0.05);
        distribution.set(EventType.UPDATE_VERTEX, 0.35);
        distribution.set(EventType.CREATE_EDGE, 0.35);
        distribution.set(EventType.REMOVE_EDGE, 0.15);
        distribution.set(EventType.UPDATE_EDGE, 0.0);
        return random.distribution(distribution);
    },

    vertexChoice(eventType: EventType, globalContext: any) {
        // degreeindex is sorted ascending according to the vertex' degree
        if (eventType === EventType.REMOVE_VERTEX) {
            // inverse heavy tail for preferrably removing less important vertices
            const index = globalContext.vertexZipf() - 1;
            return globalContext.degreeIndex._get(index).key;
        } else {
            // uniform for updates
            return random.integer(1, globalContext.vertexCount) - 1;
        }
    },

    edgeChoice(eventType: EventType, globalContext: any) {
        // pick source uniformly
        const source = random.integer(1, globalContext.vertexCount) - 1;
        // pick target with inverse heavy tail
        const target = globalContext.degreeIndex._get(globalContext.vertexCount - globalContext.vertexZipf()).key;

        return <[number, number]> [source, target];
    },

    constraint() {
        return true;
    },

    insertVertex(vertex: Vertex, globalContext: any) {
        globalContext.incVertexCount(1);
        return {
            name: chance.name(),
            birthday: chance.birthday({ string: true }),
            following: 0,
            followers: 0,
            status: chance.sentence()
        };
    },

    updateVertex(vertex: Vertex, globalContext: any) {
        // change status
        return Object.assign({}, vertex.context, {
            status: chance.sentence()
        });
    },

    removeVertex(vertex: Vertex, globalContext: any) {
        globalContext.incVertexCount(-1);
        // always remove vertex, causes all edges to be removed as well
        return true;
    },

    insertEdge(edge: Edge, globalContext: any) {
        edge.source.context.following += 1;
        edge.target.context.followers += 1;
        globalContext.degreeIndex.set(edge.source.id, edge.source.inEdges.length + edge.source.outEdges.length + 1);
        globalContext.degreeIndex.set(edge.target.id, edge.target.inEdges.length + edge.target.outEdges.length + 1);
        return {};
    },

    updateEdge(edge: Edge, globalContext: any) {
        return {};
    },

    removeEdge(edge: Edge, globalContext: any) {
        edge.source.context.following -= 1;
        edge.target.context.followers -= 1;
        globalContext.degreeIndex.set(edge.source.id, edge.source.inEdges.length + edge.source.outEdges.length - 1);
        globalContext.degreeIndex.set(edge.target.id, edge.target.inEdges.length + edge.target.outEdges.length - 1);
        return true;
    }
};
