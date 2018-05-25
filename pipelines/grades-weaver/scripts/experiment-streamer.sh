#!/bin/sh
run_file /scripts/config.sh

# retrieve jar files
get_file /workload-streamer.jar

# retrieve workloads
get_file /example-stream.csv

# run experiment
await_barrier streamer-${EXPERIMENT}
# give streamer client a head start
sleep 2

echo "Starting experiment with event rate: ${EXPERIMENT}..."
java -jar workload-streamer.jar example-stream.csv $(echo $EXPERIMENT | sed 's/aggregate-//') TCPConnector experiment-weaver $WEAVER_CONNECTOR_PORT

await_barrier finished-streamer
