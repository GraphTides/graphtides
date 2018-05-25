#!/bin/bash
# [wf] series of steps required to execute the pipeline.
source ../general/popper-swarm.sh
set -e

start_experiment_storage .
start_file_collector results

orchestrate_task "experiment-streamer" "openjdk:8-jre-alpine" "./scripts/experiment-streamer.sh"
orchestrate_task "experiment-cg1" "ech0/chronograph" "./scripts/experiment-chronograph.sh" "chronograph"
orchestrate_task "experiment-cg2" "ech0/chronograph" "./scripts/experiment-chronograph.sh" "chronograph"
orchestrate_task "experiment-cg3" "ech0/chronograph" "./scripts/experiment-chronograph.sh" "chronograph"
orchestrate_task "experiment-cg4" "ech0/chronograph" "./scripts/experiment-chronograph.sh" "chronograph"

# barrier to sync when everyone is ready
await_barrier streamer-ready worker1-ready worker2-ready worker3-ready worker4-ready

# barrier to sync after experiment has finished
await_barrier streamer-finished worker1-finished worker2-finished worker3-finished worker4-finished

# wait until all files were retrieved
await_barrier streamer-uploaded worker1-uploaded worker2-uploaded worker3-uploaded worker4-uploaded

stop_file_collector
stop_experiment_storage

remove_task "experiment-streamer"
remove_task "experiment-cg1"
remove_task "experiment-cg2"
remove_task "experiment-cg3"
remove_task "experiment-cg4"

exit 0
