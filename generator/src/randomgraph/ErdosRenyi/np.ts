import { Graph, Vertex, Edge } from '../../Graph';

/**
 * Erdős–Rényi aka Gilbert
 *
 * @param {Graph} graph the graph that is generated
 * @param {Number} n number of vertices
 * @param {Number} p probability of a edge between any two vertices
 */
module.exports = function np(graph: Graph, n: number, p: number) {
    for (let i = 0; i < n; i++) {
        graph.addVertex(new Vertex(i));

        for (let j = 0; j < i; j++) {
            if (Math.random() < p) {
                graph.addEdge(new Edge(graph.getVertex(i), graph.getVertex(j)));
            }
        }
    }
}
