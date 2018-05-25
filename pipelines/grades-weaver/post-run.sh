#!/bin/bash
# [wf] series of steps required to execute the pipeline.
source ../general/popper-swarm.sh
set -e

# prepare output for plot
plotalyze scripts/analyze.sh results results

# plot output
plotalyze scripts/scalability-plot.pg results results
plotalyze scripts/cpu-plot.pg results results

exit 0
