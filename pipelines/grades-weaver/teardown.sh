#!/bin/bash
# [wf] cleanup tasks.
set -e

# delete compiled binaries
rm workload-streamer.jar

# delete workload
rm example-stream.csv

exit 0
