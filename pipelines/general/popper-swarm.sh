#!/bin/bash
LPATH=$(realpath $(dirname $BASH_SOURCE))
if [ -z "${HOST_PORT}" ]; then 
    HOST_PORT="8080"
fi
if [ -z "${BARRIER_PORT}" ]; then 
    BARRIER_PORT="8413"
fi
if [ -z "${COLLECTOR_PORT}" ]; then 
    COLLECTOR_PORT="1337"
fi
if [ -z "${HOST_IP}" ]; then 
    HOST_IP=$(ip route get 8.8.8.8 | head -n 1 | sed -r 's/.*src ([^ ]+).*/\1/')
fi

await_barrier() {
    docker run --rm \
        --name barrier \
        -p ${BARRIER_PORT}:${BARRIER_PORT} \
        --env PORT=${BARRIER_PORT} \
        -i ech0/distributed-barrier \
        distributed-barrier $@
}
start_file_collector() {
    RESULT_DIR=$1
    mkdir -p $RESULT_DIR
    echo "Saving results in ${RESULT_DIR}"
    docker run --rm -d \
        --name file-collector \
        --user "$(id -u):$(id -g)" \
        -w /results \
        -v "$(realpath ${RESULT_DIR}):/results" \
        -p ${COLLECTOR_PORT}:${COLLECTOR_PORT} \
        -i ech0/file-collector \
        file-collector ${COLLECTOR_PORT}
}
stop_file_collector() {
    docker kill file-collector
}
start_experiment_storage() {
    docker run --rm -d \
        --volume="$(realpath $LPATH):/usr/share/nginx/html/assets:ro" \
        --volume="$(realpath $1):/usr/share/nginx/html/experiment:ro" \
        --name experiment-storage \
        -p ${HOST_PORT}:80 \
        -i jrelva/nginx-autoindex
}
stop_experiment_storage() {
    docker kill experiment-storage
}
orchestrate_task() {
    HELPER=$(< $LPATH/container-helper.sh)
    COMMAND="eval ${HELPER} && run_file $3"
    CONSTRAINT="node.id!=noconstraint"
    EXPERIMENT=$4

    if [ "$#" -gt 4 ]; then
        CONSTRAINT=$5
    fi

    docker service create \
        --restart-condition none \
        --detach \
        --name $1 \
        --workdir /tmp \
        --network experiment \
        --constraint "${CONSTRAINT}" \
        --env HOST_IP=${HOST_IP} \
        --env HOST_PORT=${HOST_PORT} \
        --env BARRIER_PORT=${BARRIER_PORT} \
        --env COLLECTOR_PORT=${COLLECTOR_PORT} \
        --env CONSTRAINT=${CONSTRAINT} \
        --env EXPERIMENT=${EXPERIMENT} \
        $2 /bin/sh -c "$COMMAND"
}
remove_task() {
    docker service rm $1
}
plotalyze() {
    # Usage: COMMAND_FILE INPUT_DIR OUTPUT_DIR
    docker run --rm \
        -w /output \
        -v "$(realpath $1):/pbin:ro" \
        -v "$(realpath $2):/input:ro" \
        -v "$(realpath $3):/output:rw" \
        --user "$(id -u):$(id -g)" \
        -i ech0/plotalyzer \
        /bin/sh -c "cp /pbin /tmp/pbin.exe; chmod +x /tmp/pbin.exe; /tmp/pbin.exe"
}

# ensure that this host is a swarm leader
docker node ls &> /dev/null
if [ $? -ne 0 ]; then
    echo "No swarm detected, initializing a local swarm..."
    docker swarm init
fi

# ensure that the experiment overlay network exists
docker network inspect experiment &> /dev/null
if [ $? -ne 0 ]; then
    echo "No experiment overlay network detecting, creating it..."
    docker network create --driver overlay experiment
fi

