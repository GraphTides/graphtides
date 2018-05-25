import { Graph, Vertex, Edge } from '../../Graph';

/**
 * Watts-Strogatz Small World model Beta
 *
 * @param {Graph} graph the graph that is generated
 * @param {Number} n number of vertices
 * @param {Number} K mean degree (even integer)
 * @param {Number} beta rewiring probability [0..1]
 */
module.exports = function beta(graph: Graph, n: number, K: number, beta: number) {
    // divide by two
    K = K>>1;
    for (let i = 0; i < n; i++) {
        graph.addVertex(new Vertex(i));
    }

    for (let i = 0; i < n; i++) {
        // create a latice ring structure
        for (let j = 1; j <= K; j++) {
            graph.addEdge(new Edge(graph.getVertex(i), graph.getVertex((i + j) % n)));
        }
    }

    // rewiring of edges
    for (let i = 0; i < n; i++) {
        for (let j = 1; j <= K; j++) {
            // for every pair of vertices
            if (Math.random() <= beta) {
                let t;

                do {
                    t = Math.floor(Math.random() * (n-1));
                } while (t === i || graph.hasEdge(i, t));

                graph.removeEdge(graph.getEdge(i, (i + j) % n));
                graph.addEdge(new Edge(graph.getVertex(i), graph.getVertex(t)));
            }
        }
    }
}
