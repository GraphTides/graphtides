import { Graph, Vertex, Edge } from '../../Graph';

/**
 * Erdős–Rényi
 *
 * @param {Graph} graph the graph that is generated
 * @param {Number} n number of vertices
 * @param {Number} M number of edges
 */
module.exports = function nm(graph: Graph, n: number, M: number) {
    const tmpEdges = [];

    for (let i = 0; i < n; i++) {
        graph.addVertex(new Vertex(i));
        for (let j = i + 1; j < n; j++) {
            tmpEdges.push({ source: i, target: j });
        }
    }

    // pick m random edges from tmpEdges
    let k = tmpEdges.length - 1;
    for (let i = 0; i < M; i++) {
        const tmpEdge = tmpEdges.splice(Math.floor(Math.random()*k), 1)[0];
        graph.addEdge(new Edge(graph.getVertex(tmpEdge.source), graph.getVertex(tmpEdge.target)));
        k -= 1;
    }
}
