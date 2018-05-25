#!/bin/bash
# [wf] any setup required by the pipeline.
set -e

# compile jar
docker run --rm \
    --user "$(id -u):$(id -g)" \
    -v "$(realpath ../../streamer/src):/src:ro" \
    -v "$(realpath .):/out:rw" \
    -i openjdk:8-jdk-alpine \
    /bin/sh -c "mkdir /tmp/b; cd /src; javac -d /tmp/b de/uulm/in/vs/streamer/Main.java; cd /tmp/b; jar cmf /src/META-INF/MANIFEST.MF /out/workload-streamer.jar ."

# prepare workload
tar -xf ../../workloads/example-stream.tar.gz

exit 0
