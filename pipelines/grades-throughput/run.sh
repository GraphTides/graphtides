#!/bin/bash
# [wf] series of steps required to execute the pipeline.

source ../general/popper-swarm.sh
set -e

start_experiment_storage .
start_file_collector results

orchestrate_task "experiment-01" "openjdk:8-jre-alpine" "./scripts/experiment.sh" "throughput"

# barrier to sync after experiment has finished
await_barrier finished

# wait until all files were retrieved
await_barrier uploaded

stop_file_collector
stop_experiment_storage

remove_task "experiment-01"

exit 0
