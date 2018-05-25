#!/bin/bash
# [wf] validate the output of pipeline.
set -e

test -f results/plot1.pdf
test -f results/plot2.pdf
test -f results/plot3.pdf
test -f results/plot4.pdf
test -f results/plot5.pdf

exit 0
