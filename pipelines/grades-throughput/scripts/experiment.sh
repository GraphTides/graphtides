#!/bin/sh

REPEATS=30

# retrieve jar files
get_dir /bin/

# retrieve workloads
get_dir /workloads/

# run experiment
for workload in workloads/*; do
    rate=$(echo $workload | sed -r 's/[^-]*-([^.]*).csv/\1/')
    echo "Starting experiment with event rate: $rate"

    # sub experiment 1: pipe throughput
    mkdir -p results/pipe/$rate
    for i in $(seq 1 $REPEATS); do
        java -jar bin/workload-streamer.jar $workload $rate ConsoleConnector | java -jar bin/streamer-evaluation.jar results/pipe/$rate/
    done

    # sub experiment 1: tcp throughput
    mkdir -p results/tcp/$rate
    for i in $(seq 1 $REPEATS); do
        PORT=$((5000+$i))
        java -jar bin/streamer-evaluation.jar results/tcp/$rate/ $PORT &
        sleep 1
        java -jar bin/workload-streamer.jar $workload $rate TCPConnector 127.0.0.1 $PORT
        sleep 1
    done
done

await_barrier finished
push_files results/
await_barrier uploaded
