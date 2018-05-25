#!/bin/bash
# [wf] series of steps required to execute the pipeline.
source ../general/popper-swarm.sh
set -e

tmp=$(mktemp -d)

# prepare output for plot
plotalyze scripts/analyze.sh results $tmp

# plot output
plotalyze scripts/plot.pg $tmp results

rm -r $tmp

exit 0
