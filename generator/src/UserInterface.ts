import { Vertex, Edge, Graph, EventType } from './Graph';

/**
 * Determines the initial state of the global context.
 *
 * @returns {object} The initial global context object.
 */
export interface bootstrapGlobalContextFunctionType {
    (): object;
}

/**
 * Initially boostraps the graph.
 *
 * @param {graph} the graph that should be bootstrapped.
 * @param {object} globalContext the global context.
 */
export interface bootstrapGraphFunctionType {
    (graph: Graph, globalContext: object): void;
}

/**
 * Decides what type of event is produced in the next round.
 *
 * @param {object} globalContext the global context.
 * @returns {EventType} The type of the next event.
 */
export interface nextEventTypeFunctionType {
    (globalContext: object): EventType;
}

/**
 * Selects the target vertex for {INSERT/UPDATE/DELETE}_VERTEX events.
 *
 * @param {object} globalContext the global context.
 * @returns {EventType} The type of the next event.
 */
export interface vertexChoiceFunctionType {
    (eventType: EventType, globalContext: object): number;
}

/**
 * Selects the target edge for {INSERT/UPDATE/DELETE}_EDGE events.
 *
 * @param {object} globalContext the global context.
 * @returns {EventType} The type of the next event.
 */
export interface edgeChoiceFunctionType {
    (eventType: EventType, globalContext: object): [number, number];
}

/**
 * Is invoked at the end of each round, to verify whether the round's result is valid or not.
 * If not the the round is repeated.
 *
 * @returns {boolean} true, when the round is valid.
 */
export interface constraintFunctionType {
    (): boolean;
}

/**
 * Is called for every insert vertex event, and determines the state of the resulting vertex.
 *
 * @param {Vertex} vertex the inserted vertex.
 * @param {object} globalContext the global context.
 * @returns {object} the vertex' state.
 */
export interface insertVertexFunctionType {
    (vertex: Vertex, globalContext: object): object;
}

/**
 * Is called for every insert vertex event, and determines the state of the resulting vertex.
 *
 * @param {Edge} edge the inserted edge.
 * @param {object} globalContext the global context.
 * @returns {object} the edge's state.
 */
export interface insertEdgeFunctionType {
    (edge: Edge, globalContext: object): object;
}

/**
 * Is called for every update vertex event, and determines the updated state of the vertex.
 *
 * @param {Vertex} vertex the vertex that is being updated.
 * @param {object} globalContext the global context.
 * @returns {object} the new vertex context.
 */
export interface updateVertexFunctionType {
    (vertex: Vertex, globalContext: object): object;
}

/**
 * Is called for every update edge event, and determines the updated state of the edge.
 *
 * @param {Edge} edge the edge that is being updated.
 * @param {object} globalContext the global context.
 * @returns {object} the new vertex context.
 */
export interface updateEdgeFunctionType {
    (edge: Edge, globalContext: object): object;
}

/**
 * Is called for every remove vertex event, and determines if the vertex should be removed.
 *
 * @param {Vertex} vertex the vertex that is being removed.
 * @param {object} globalContext the global context.
 * @returns {boolean} whether to remove the vertex or not.
 */
export interface removeVertexFunctionType {
    (vertex: Vertex, globalContext: object): boolean;
}

/**
 * Is called for every remove edge event, and determines if the edge should be removed.
 *
 * @param {Edge} edge the edge that is being removed.
 * @param {object} globalContext the global context.
 * @returns {boolean} whether to remove the edge or not.
 */
export interface removeEdgeFunctionType {
    (edge: Edge, globalContext: object): boolean;
}

export default interface UserInterface {
    bootstrapGlobalContext: bootstrapGlobalContextFunctionType,
    bootstrapGraph: bootstrapGraphFunctionType,
    nextEventType: nextEventTypeFunctionType,
    vertexChoice: vertexChoiceFunctionType,
    edgeChoice: edgeChoiceFunctionType,
    constraint: constraintFunctionType,
    insertVertex: insertVertexFunctionType,
    insertEdge: insertEdgeFunctionType,
    updateVertex: updateVertexFunctionType,
    updateEdge: updateEdgeFunctionType
    removeVertex: removeVertexFunctionType,
    removeEdge: removeEdgeFunctionType
}
