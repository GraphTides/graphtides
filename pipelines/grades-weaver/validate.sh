#!/bin/bash
# [wf] validate the output of pipeline.
set -e

test -f results/cpu-plot.pdf
test -f results/scalability-plot.pdf

exit 0
