import * as fs from 'fs';
import * as path from 'path';
import UserInterface from './UserInterface';
import { Graph, EventStream, Vertex, Edge, EventType } from './Graph';

const minimist = require('minimist');
const seedrandom = require('seedrandom');
const ProgressBar = require('progress');

const argv = minimist(process.argv.slice(2), {
    string: ['seed', 'input', 'output'],
    boolean: ['help'],
    default: { seed: '' }
});

if (!argv.hasOwnProperty('input') || !fs.existsSync(path.resolve(argv.input))) {
    console.error('Error: No input file specified!');
    argv.help = true;
}

if (!argv.hasOwnProperty('rounds') || Number.isNaN(Number.parseInt(argv.rounds, 10))) {
    console.error('Error: No round count specified!');
    argv.help = true;
}

if (argv.help) {
    console.log('Usage: ');
    console.log(`  ${process.argv[0]} ${process.argv[1]} [--seed <seed>] --rounds <rounds> --input <userScript.ts> --output <eventStream.csv>`);
    console.log(`  ${process.argv[0]} ${process.argv[1]} --help`);

    console.log();
    console.log('Options:');
    console.log('  --help           Show this screen.');
    console.log('  --seed=\'\'        The seed for the pseudo random number generator.');
    console.log('  --rounds         The amount of rounds for phase 2.');
    console.log('  --input          The user defined script that specifies the phase 1 and phase 2 behavior.');
    console.log('  --output         The file name of the event stream file.');

    console.log();
    console.log('Examples: ');
    console.log(`  ${process.argv[0]} ${process.argv[1]} --input foobar.ts --output stream.csv`);
    console.log(`  ${process.argv[0]} ${process.argv[1]} --seed foobar --input foobar.ts --output stream.csv`);

    process.exit(0);
}

// set random seed according to command line parameter
(Math as any).seedrandom(argv.seed);

// load user-defined script
const userScript: UserInterface = require(path.resolve(argv.input));

// initialize the event stream
const eventStream = new EventStream(fs.createWriteStream(argv.output));

// instantiate and bootstrap graph
const graph = new Graph(
    userScript.bootstrapGlobalContext,
    userScript.bootstrapGraph,
    userScript.insertVertex,
    userScript.updateVertex,
    userScript.removeVertex,
    userScript.insertEdge,
    userScript.updateEdge,
    userScript.removeEdge,
    eventStream
);

const rounds = Number.parseInt(argv.rounds, 10);
const bar = new ProgressBar('Progress :bar :current/:total', { total: rounds });
let errors = 0;

for (let i  = 0; i < rounds; i++) {
    const eventType: EventType = userScript.nextEventType(graph.globalContext);

    try {
        switch (eventType) {
            case EventType.CREATE_VERTEX: {
                graph.addVertex(new Vertex(graph.lastVertexId + 1));
                break;
            }

            case EventType.REMOVE_VERTEX: {
                const targetVertex = userScript.vertexChoice(eventType, graph.globalContext);
                graph.removeVertex(graph.getVertex(targetVertex));
                break;
            }

            case EventType.UPDATE_VERTEX: {
                const targetVertex = userScript.vertexChoice(eventType, graph.globalContext);
                graph.updateVertex(graph.getVertex(targetVertex));
                break;
            }

            case EventType.CREATE_EDGE: {
                const targetEdge = userScript.edgeChoice(eventType, graph.globalContext);
                graph.addEdge(new Edge(graph.getVertex(targetEdge[0]), graph.getVertex(targetEdge[1])));
                break;
            }

            case EventType.UPDATE_EDGE: {
                const targetEdge = userScript.edgeChoice(eventType, graph.globalContext);
                graph.updateEdge(graph.getEdge(targetEdge[0], targetEdge[1]));
                break;
            }

            case EventType.REMOVE_EDGE: {
                const targetEdge = userScript.edgeChoice(eventType, graph.globalContext);
                graph.removeEdge(graph.getEdge(targetEdge[0], targetEdge[1]));
                break;
            }
        }

        bar.tick();
    } catch (e) {
        errors++;
        i--;
    }
}

console.log('Errors: ', errors);
eventStream.close();
