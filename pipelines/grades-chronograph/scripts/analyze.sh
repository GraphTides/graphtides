#!/bin/sh
cd /output/

mergeFiles() {
    tmpa=$(mktemp)
    tmpb=$(mktemp)
    join --nocheck-order -a1 -a2 -1 1 -2 1 -o 0,1.2,2.2 -e "0" $1 $2 > $tmpa
    join --nocheck-order -a1 -a2 -1 1 -2 1 -o 0,1.2,2.2 -e "0" $3 $4 > $tmpb
    join --nocheck-order -a1 -a2 -1 1 -2 1 -o 0,1.2,1.3,2.2,2.3 -e "0" $tmpa $tmpb > $5
    rm $tmpa $tmpb
}

minimum=$(head -n 1 streamer-log.txt | awk '{ print int($1/1000) }')

MAKE_INCREMENTAL='
FNR == 1 {
    ## Process first line.
    C=0
    split($0, a, "\t")
    for (i=C; i < (a[1]); i++) {
        printf("%d\t0\n", C)
        C++
    }
    print $0;

    while ( getline == 1 ) {
        ## Process from second to last line.
        split($0, a, "\t")
        for (i=C; i < (a[1]); i++) {
            printf("%d\t0\n", C)
            C++
        }
        print $0;
        C++
    }

    printf("%d\t0\n", C)
}
'

# plot 1: ingress messages
cat streamer-log.txt | awk -v begin="$minimum" '{ print int($1/1000 - begin) }' | sort -n | uniq -c | awk '{ printf("%s\t%s\n", $2, $1); }' | sort -n | awk "$MAKE_INCREMENTAL" > streamer-log-processed.txt

# plot 2: internal ops
for log in logs-*/perf-*.log; do
    cat $log | grep core-engine.processed | awk -F ',' -v begin="$minimum" '{ print int($2/1e6 - begin) }' | grep -v '^-' | sort -n | uniq -c | awk '{ printf("%s\t%s\n", $2, $1); }' | sort -n | awk "$MAKE_INCREMENTAL" > received-$(basename $log)
done
mergeFiles received-perf-0.log received-perf-1.log received-perf-2.log received-perf-3.log received.txt

# plot 4: buffer sizes
for log in logs-*/perf-*.log; do
    cat $log | grep buffersize | awk -F ',' -v begin="$minimum" '{ printf("%d\t%d\n", int($2/1e6 - begin), $4) }' | grep -v '^-' | sort -n > buffer-$(basename $log)
done
mergeFiles buffer-perf-0.log buffer-perf-1.log buffer-perf-2.log buffer-perf-3.log buffers.txt

# plot 3: cpu
for log in logs-*/pidstat.log; do
    name=$(echo $log | sed -r 's/[^\/]*\/([^\/]*)\/.*/\1/')
    cat $log | tail -n +2 | grep -v '^#' | grep -v "^$" | awk -v begin="$minimum" '{ printf("%d\t%d\n", $1 - begin, $7) }' | grep -v '^-' > cpu${name}.txt
done
mergeFiles cpulogs-1.txt cpulogs-2.txt cpulogs-3.txt cpulogs-4.txt cpulogs.txt
