import { Graph, Vertex, Edge } from '../../Graph';

/**
 * Watts-Strogatz Small World model Alpha
 *
 * @param {Graph} graph the graph that is generated
 * @param {Number} n number of vertices
 * @param {Number} K mean degree (even integer)
 * @param {Number} alpha rewiring probability [0..1]
 */
module.exports = function alpha(graph: Graph, n: number, k: number, alpha: number) {
    const p = Math.pow(10, -10);
    const nkHalf = n * k / 2;
    const ids = [];
    let ec = 0;

    for (let i = 0; i < n; i++) {
        graph.addVertex(new Vertex(i));
    }

    for (let i = 0; i < n; i++) {
        // create a latice ring structure
        graph.addEdge(new Edge(graph.getVertex(i), graph.getVertex((i + 1) % n)));
        ec++;
    }

    // Creating n * k / 2 edges
    while (ec < nkHalf) {
        for (let i = 0; i < n; i++) {
            ids.push(i);
        }

        while (ec < nkHalf && ids.length > 0) {
            let i = ids.splice(Math.floor(Math.random()*ids.length), 1)[0];
            let Rij = [];
            let sumRij = 0;

            for (let j = 0; j < n; j++) {
                Rij[j] = calculateRij(i, j);
                sumRij += Rij[j];
            }

            let r = Math.random();
            let pij = 0;
            for (let j = 0; j < n; j++) {
                if (i != j) {
                    pij += Rij[j] / sumRij;
                    if (r <= pij) {
                        graph.addEdge(new Edge(graph.getVertex(i), graph.getVertex(j)));
                        ec++;
                    }
                }
            }
        }
    }

    function calculateRij(i: number, j: number) {
        if (i === j || graph.hasEdge(i, j)) {
            return 0;
        }

        const mij = calculatemij(i, j);

        if (mij >= k) {
            return 1;
        }

        if (mij === 0) {
            return p;
        }

        return Math.pow(mij / k, alpha) * (1 - p) + p;
    }

    function calculatemij(i: number, j: number) {
        let mij = 0;

        for (let l = 0; l < n; l++) {
            if (l !== i && l !== j && graph.hasEdge(i, l) && graph.hasEdge(j, l)) {
                mij++;
            }
        }

        return mij;
    }
}
