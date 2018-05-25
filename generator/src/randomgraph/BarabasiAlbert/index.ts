import { Graph, Vertex, Edge } from '../../Graph';

/**
 * Barabási–Albert
 *
 * @param {Graph} graph the graph that is generated
 * @param {Number} N total number of vertices  N  > 0
 * @param {Number} m0 m0 > 0 && m0 < N
 * @param {Number} M M  > 0 && M  <= m0
 */
module.exports = function BarabasiAlbert(graph: Graph, N: number, m0: number, M: number) {
    // creating m0 vertices
    for (let i = 0; i < m0; i++) {
        graph.addVertex(new Vertex(i));
    }

    // Linking every vertex with each other (no self-loops)
    for (let i = 0; i < m0; i++) {
        for (let j = i + 1; j < m0; j++) {
            graph.addEdge(new Edge(graph.getVertex(i), graph.getVertex(j)));
        }
    }
    // Adding N - m0 vertices, each with M edges
    for (let i = m0; i < N; i++) {
        graph.addVertex(new Vertex(i));

        // sum of all vertices degrees
        let sum = 0;
        for (let [i, vertex] of graph.vertices) {
            sum += vertex.inEdges.length;
            sum += vertex.outEdges.length;
        }

        let s = 0;
        for (let m = 0; m < M; m++) {
            let r = Math.random();
            let p = 0;
            for (let j = 0; j < i; j++) {
                if (graph.hasEdge(i, j) || graph.hasEdge(j, i)) {
                    continue;
                }

                if (i == 1) {
                    p = 1;
                } else {
                    const v = <Vertex> graph.vertices.get(j);
                    p += (v.inEdges.length + v.outEdges.length) / sum + s / (i - m);
                }

                if (r <= p) {
                    const v = <Vertex> graph.vertices.get(j);
                    s += (v.inEdges.length + v.outEdges.length) / sum;
                    graph.addEdge(new Edge(graph.getVertex(i), graph.getVertex(j)));
                    break;
                }
            }
        }
    }
}
