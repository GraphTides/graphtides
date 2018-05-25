#!/bin/bash
# [wf] series of steps required to execute the pipeline.

source ../general/popper-swarm.sh
set -e

# prepare output for plot
plotalyze scripts/analyze.sh results results

# prepare error data for plot 5
docker run --rm 
    -v "$(realpath scripts/compute-errors.js):/compute-errors.js:ro" \
    -v "$(realpath results):/output:rw" \
    --user "$(id -u):$(id -g)" \
    -w /output -it node:alpine \
    /bin/sh -c "node /compute-errors.js > /output/rank-error.csv"

# plot results
plotalyze scripts/plot1.pg results results
plotalyze scripts/plot2.pg results results
plotalyze scripts/plot3.pg results results
plotalyze scripts/plot4.pg results results
plotalyze scripts/plot5.pg results results

exit 0
