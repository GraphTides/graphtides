#!/usr/bin/node
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

function median(values) {
    values = values.slice(0).sort( function(a, b) {return a - b; } );
    return middle(values);
}

function middle(values) {
    var len = values.length;
    var half = Math.floor(len / 2);

    if(len % 2) {
        return (values[half - 1] + values[half]) / 2.0;
    } else {
        return values[half];
    }
}

const rl = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, '../cg_pagerank.csv')),
  crlfDelay: Infinity
});

const groundTruth = {};

let c = true;
rl.on('line', (line) => {
    if (c) {
        c = false;
        return;
    }

    const entry = line.split(',');
    groundTruth[entry[0]] = parseFloat(entry[1]);
});

rl.on('close', () => {
    const sortedTruth = Object.keys(groundTruth).sort((a, b) => groundTruth[a] - groundTruth[b]).slice(-1);

    const messages = [];
    for (let i = 0; i < 4; i++) {
        const contents = JSON.parse(fs.readFileSync(path.join(__dirname, `../results/logs-${i+1}/worker${i}.log`), 'utf8'));
        contents.measurements.userMessages.forEach(([time, msg]) => {
            msg = msg.split('|');
            messages.push([
                    time[0] + time[1] / 1e9,
                    msg[1].slice(6),
                    msg[2]
            ]);
        });
    }

    messages.sort((a, b) => b[0] - a[0]);

    let second = 0;
    const ranks = {};
    while (messages.length > 0) {
        const msg = messages.pop();

        ranks[msg[1]] = parseFloat(msg[2]);
        if (Math.round(msg[0]) > second) {
            second = Math.round(msg[0]);

            const sum = Object.keys(ranks).reduce((a, k) => a + ranks[k], 0);

            const errors = sortedTruth.map((k) => {
                const rank = ranks.hasOwnProperty(k) ? (ranks[k]/sum) : 0;
                return Math.abs(1 - (rank / groundTruth[k]));
            });

            const err = average(errors);
            console.log(`${second}\t${err}`);
        }
    }
});
