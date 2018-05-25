#!/bin/bash
# [wf] any setup required by the pipeline.
set -e

compile_jar() {
    # Usage: SRC_DIR MAIN_FILE OUT_DIR OUT_FILE
    docker run --rm \
        --user "$(id -u):$(id -g)" \
        -v "$(realpath $1):/src:ro" \
        -v "$(realpath $3):/out:rw" \
        -i openjdk:8-jdk-alpine \
        /bin/sh -c "mkdir /tmp/b; cd /src; javac -d /tmp/b $2; cd /tmp/b; jar cmf /src/META-INF/MANIFEST.MF /out/$4 ."
}

# compile jar files
OUT_DIR="./bin"
mkdir -p $OUT_DIR
compile_jar "../../streamer/src" "de/uulm/in/vs/streamer/Main.java" $OUT_DIR "workload-streamer.jar"
compile_jar "../../streamer-evaluation/src" "de/uulm/in/vs/streamer/evaluation/Measure.java" $OUT_DIR "streamer-evaluation.jar"

# prepare workloads
mkdir -p workloads
cd workloads
tar -xf ../../../workloads/workload-10000.tar.gz
cat workload-10000.csv workload-10000.csv > workload-20000.csv
cat workload-20000.csv workload-20000.csv > workload-40000.csv
cat workload-40000.csv workload-40000.csv > workload-80000.csv
cat workload-80000.csv workload-80000.csv > workload-160000.csv
cat workload-160000.csv workload-160000.csv > workload-320000.csv

exit 0
