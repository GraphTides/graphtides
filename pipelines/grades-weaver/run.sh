#!/bin/bash
# [wf] series of steps required to execute the pipeline.

source ../general/popper-swarm.sh
source ./scripts/config.sh
set -e

start_experiment_storage .
start_file_collector results

for rate in $RATES; do
    orchestrate_task "experiment-streamer" "openjdk:8-jre-alpine" "./scripts/experiment-streamer.sh" "${rate}"
    orchestrate_task "experiment-weaver" "weaver/weaver" "./scripts/experiment-weaver.sh" "${rate}"
    await_barrier streamer-${rate} weaver-${rate}

    # barrier to sync after experiment has finished
    await_barrier finished-streamer finished-weaver

    docker service logs experiment-streamer
    docker service logs experiment-weaver

    remove_task "experiment-streamer"
    remove_task "experiment-weaver"
done

stop_file_collector
stop_experiment_storage

exit 0
