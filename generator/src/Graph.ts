import {
    bootstrapGlobalContextFunctionType,
    bootstrapGraphFunctionType,
    insertVertexFunctionType,
    updateVertexFunctionType,
    removeVertexFunctionType,
    insertEdgeFunctionType,
    updateEdgeFunctionType,
    removeEdgeFunctionType
} from './UserInterface';

import { WriteStream} from 'fs';

export enum EventType {
    CREATE_VERTEX = 'CREATE_VERTEX',
    REMOVE_VERTEX = 'REMOVE_VERTEX',
    UPDATE_VERTEX = 'UPDATE_VERTEX',
    CREATE_EDGE = 'CREATE_EDGE',
    REMOVE_EDGE = 'REMOVE_EDGE',
    UPDATE_EDGE = 'UPDATE_EDGE'
};

export class Vertex {
    id: number;
    label: string;
    created: boolean;
    index: number;
    inEdges: Edge[];
    outEdges: Edge[];
    context: any;

    constructor(id: number, index: number = 0) {
        this.id = id;
        this.label = `vertex ${id}`;
        this.created = false;
        this.index = index;
        this.inEdges = [];
        this.outEdges = [];
        this.context = {};
    }

    toString(): string {
        return `${this.id}`;
    }
}

export class Edge {
    source: Vertex;
    target: Vertex;
    context: any;

    constructor(source: Vertex, target: Vertex, context: object = {}) {
        this.source = source;
        this.target = target;
        this.context = context;
    }

    toString(): string {
        return `${this.source.id}-${this.target.id}`;
    }
}

export class Event {
    type: EventType;
    source: Vertex | Edge;
    state: string;

    constructor(type: EventType, source: Vertex | Edge) {
        this.type = type;
        this.source = source;
        this.state = JSON.stringify(source.context);
    }

    toString(): string {
        return `${this.type},${this.source.toString()},${this.state}`;
    }
}

export class EventStream {
    stream: WriteStream;

    constructor(stream: WriteStream) {
        this.stream = stream;
    }

    push(e: Event) {
        this.stream.write(`${e.toString()}\n`);
    }

    close() {
        this.stream.end();
    }
}

export class Graph {
    globalContext: object;
    insertVertexFunction: insertVertexFunctionType;
    updateVertexFunction: updateVertexFunctionType;
    removeVertexFunction: removeVertexFunctionType;
    insertEdgeFunction: insertEdgeFunctionType;
    updateEdgeFunction: updateEdgeFunctionType;
    removeEdgeFunction: removeEdgeFunctionType;

    lastVertexId: number;

    vertices: Map<number, Vertex>;
    edges: Map<string, Edge>;
    stream: EventStream;

    constructor(
        bootstrapGlobalContext: bootstrapGlobalContextFunctionType,
        bootstrapGraph: bootstrapGraphFunctionType,
        insertVertexFunction: insertVertexFunctionType,
        updateVertexFunction: updateVertexFunctionType,
        removeVertexFunction: removeVertexFunctionType,
        insertEdgeFunction: insertEdgeFunctionType,
        updateEdgeFunction: updateEdgeFunctionType,
        removeEdgeFunction: removeEdgeFunctionType,
        eventStream: EventStream
    ) {
        this.globalContext = bootstrapGlobalContext();

        this.insertVertexFunction = insertVertexFunction;
        this.updateVertexFunction = updateVertexFunction;
        this.removeVertexFunction = removeVertexFunction;

        this.insertEdgeFunction = insertEdgeFunction;
        this.updateEdgeFunction = updateEdgeFunction;
        this.removeEdgeFunction = removeEdgeFunction;

        this.vertices = new Map();
        this.edges = new Map();

        this.stream = eventStream;

        bootstrapGraph(this, this.globalContext);
    }

    getVertex(vertexId: number): Vertex {
        const vertex = this.vertices.get(vertexId);
        if (vertex === undefined) {
            throw 'vertex does not exist';
        }
        return <Vertex> vertex;
    }

    addVertex(vertex: Vertex): void {
        this.vertices.set(vertex.id, vertex);
        this.lastVertexId = vertex.id;
    }

    removeVertex(vertex: Vertex): boolean {
        if (this.removeVertexFunction(vertex, this.globalContext)) {
            // delete incoming edges
            for (let edge of vertex.inEdges) {
                this.stream.push(new Event(EventType.REMOVE_EDGE, edge));
                this.edges.delete(`${edge.source.id}-${edge.target.id}`);
                edge.source.outEdges.splice(edge.source.outEdges.indexOf(edge), 1);
                edge.target.inEdges.splice(edge.target.inEdges.indexOf(edge), 1);
            }

            // delete outgoing edges
            for (let edge of vertex.outEdges) {
                this.stream.push(new Event(EventType.REMOVE_EDGE, edge));
                this.edges.delete(`${edge.source.id}-${edge.target.id}`);
                edge.source.outEdges.splice(edge.source.outEdges.indexOf(edge), 1);
                edge.target.inEdges.splice(edge.target.inEdges.indexOf(edge), 1);
            }

            // delete vertex
            this.stream.push(new Event(EventType.REMOVE_VERTEX, vertex));
            this.vertices.delete(vertex.id);
            return true;
        }
        return false;
    }

    updateVertex(vertex: Vertex): void {
        vertex.context = this.updateVertexFunction(vertex, this.globalContext);
        this.stream.push(new Event(EventType.UPDATE_VERTEX, vertex));
    }

    hasEdge(sourceId: number, targetId: number): boolean {
        return this.edges.has(`${sourceId}-${targetId}`);
    }

    getEdge(sourceId: number, targetId: number): Edge {
        const edge = this.edges.get(`${sourceId}-${targetId}`);
        if (edge === undefined) {
            throw 'edge does not exist';
        }

        return <Edge> edge;
    }

    addEdge(edge: Edge): void {
        if (edge.source.created === false) {
            // create source in stream
            edge.source.created = true;
            edge.source.context = this.insertVertexFunction(edge.source, this.globalContext);
            this.stream.push(new Event(EventType.CREATE_VERTEX, edge.source));
        }

        if (edge.target.created === false) {
            // create target in stream
            edge.target.created = true;
            edge.target.context = this.insertVertexFunction(edge.target, this.globalContext);
            this.stream.push(new Event(EventType.CREATE_VERTEX, edge.target));
        }

        edge.context = this.insertEdgeFunction(edge, this.globalContext);

        edge.source.outEdges.push(edge);
        edge.target.inEdges.push(edge);

        this.edges.set(`${edge.source.id}-${edge.target.id}`, edge);
        this.stream.push(new Event(EventType.CREATE_EDGE, edge));
    }

    updateEdge(edge: Edge): void {
        edge.context = this.updateEdgeFunction(edge, this.globalContext);
        this.stream.push(new Event(EventType.UPDATE_EDGE, edge));
    }

    removeEdge(edge: Edge): boolean {
        if (this.removeEdgeFunction(edge, this.globalContext)) {
            this.stream.push(new Event(EventType.REMOVE_EDGE, edge));
            this.edges.delete(`${edge.source.id}-${edge.target.id}`);
            edge.source.outEdges.splice(edge.source.outEdges.indexOf(edge), 1);
            edge.target.inEdges.splice(edge.target.inEdges.indexOf(edge), 1);

            return true;
        }
        return false;
    }
}
