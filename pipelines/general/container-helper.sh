#!/bin/sh

while [ "$(md5sum /bin/barrier-client | awk '{ print $1 }')" != "7eacdcf32416474db97575414a5dddd1" ]; do
    wget -c -O /bin/barrier-client http://${HOST_IP}:${HOST_PORT}/assets/barrier-client
done
chmod +x /bin/barrier-client

get_file() {
    echo get_file $@
    while [ true ]; do
        wget -c http://${HOST_IP}:${HOST_PORT}/experiment/$1 2> /dev/null
        if [ $? -ne 0 ]; then
            break
        fi
    done
}

get_dir() {
    echo get_dir $@
    mkdir $(basename $1)
    cd $(basename $1)
    wget -qO - http://${HOST_IP}:${HOST_PORT}/experiment/$1 | tail -n +5 | head -n -2 | sed -r 's/[^"]*"([^"]*)".*/\1/' | while read FILE; do
        get_file $1/$FILE
    done
    cd ..
}

await_barrier() {
    echo await_barrier $@

    while [ true ]; do
        /bin/barrier-client ${HOST_IP} ${BARRIER_PORT} $1
        if [ $? -eq 0 ]; then
            echo "breaking"
            break
        fi

        echo "retrying..."
        sleep 1
    done
}

run_file() {
    echo run_file $@
    eval "$(wget -qO - http://${HOST_IP}:${HOST_PORT}/experiment/$1)"
}

push_files() {
    echo push_files $@
    while true; do
        echo "next try..."
        tar cf - $@ | nc -w 5 ${HOST_IP} ${COLLECTOR_PORT}

        if [ $? -eq 0 ]; then
            echo "breaking"
            break
        else
            echo "retrying..."
            sleep 1
        fi
    done
    echo pushed $@
}
