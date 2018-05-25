#!/bin/bash
# [wf] cleanup tasks.
set -e

# delete compiled binaries
rm workload-streamer.jar

# delete workload
rm chronograph-stream.tar.gz

exit 0
