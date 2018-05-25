#!/bin/sh

# retrieve jar file
get_file workload-streamer.jar

# retrieve workload
get_file chronograph-stream.csv

await_barrier streamer-ready

# run experiment
echo "Starting streamer..."
java -jar workload-streamer.jar chronograph-stream.csv 2000 ChronographConnector 13337

echo "Finished streamer"
await_barrier streamer-finished

push_files streamer-log.txt
await_barrier streamer-uploaded
