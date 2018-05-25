#!/bin/sh

# path configuration
WORKER_SUFFIX="$(echo $CONSTRAINT | sed -r 's/.*(.)$/\1/')"
WORKER_IP="134.60.77.1${WORKER_SUFFIX}"

cd /opt/chronograph
get_file scripts/config.json
mv config.json src/config.json

await_barrier worker${WORKER_SUFFIX}-ready
mkdir -p logs

sleep 5
echo "ready, starting chronograph..."
node src/index.js --worker-count 4 --worker-num $(($WORKER_SUFFIX - 1)) &
PID=$!
pidstat -hudr -p $PID 1 > logs/pidstat.log &
PIDSTAT=$!

wait $PID
kill $PIDSTAT

await_barrier worker${WORKER_SUFFIX}-finished
echo "finished chronograph"

mv logs logs-${WORKER_SUFFIX}

push_files logs-${WORKER_SUFFIX}/
await_barrier worker${WORKER_SUFFIX}-uploaded
