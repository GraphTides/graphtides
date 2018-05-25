import { Graph, Vertex, Edge } from '../../Graph';

/**
 * Simple balanced tree
 *
 * @param {Graph} graph the graph that is generated
 * @param {Number} r number of children each vertex has
 * @param {Number} h height of the tree
 */
module.exports = function BalancedTree(graph: Graph, r: number, h: number) {
    graph.addVertex(new Vertex(0, 0));

    let v = 0;
    let leaves;
    let newLeaves = [];

    for (let i = 0; i < r; i++) {
        const vertex = new Vertex(++v, (v-1));
        newLeaves.push(vertex);

        graph.addVertex(vertex);
        graph.addEdge(new Edge(graph.getVertex(0), graph.getVertex(v)));
    }

    for (let height = 1; height < h; height++) {
        leaves = newLeaves;
        newLeaves = [];

        for (let j = 0; j < leaves.length; j++) {
            for (let i = 0; i < r; i++) {
                const vertex = new Vertex(++v, (v-1));
                newLeaves.push(vertex);

                graph.addVertex(vertex);
                graph.addEdge(new Edge(graph.getVertex(leaves[j].index), graph.getVertex(v)));
            }
        }
    }
}
