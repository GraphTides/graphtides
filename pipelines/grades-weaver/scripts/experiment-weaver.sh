#!/bin/sh
apt-get install -y sysstat
run_file /scripts/config.sh

echo | /start_weaver.sh
sleep 2
/weaver_shard.sh &
/weaver_timestamper.sh &

get_file /scripts/streamer_client.py

mkdir results
# run experiment
await_barrier weaver-${EXPERIMENT}
ps aux | grep -E 'weaver-|daemon' | grep -v grep | awk '{print $2, $11}' | while read i; do
    pidstat -hudr -p $(echo $i | awk '{print $1}') 1 > results/pidstat-$(echo $i | sed 's/ /-/g')-${EXPERIMENT}.txt &
done
echo $EXPERIMENT | grep aggregate >/dev/null 2>/dev/null
if [ $? -eq 0 ]; then
    python streamer_client.py $WEAVER_CONNECTOR_PORT 10
else
    python streamer_client.py $WEAVER_CONNECTOR_PORT 1
fi
mv results.txt results/results-${EXPERIMENT}.txt
killall pidstat

push_files results/
await_barrier finished-weaver
