#!/bin/sh
cd /output

for i in results/results*.txt; do
    cat $i | awk '{$3 = $2 - prev; prev = $2; printf("%d\t%d\n", $1, $3);}' > $i.tsv
done

# plot 3: cpu
rm -f cpu*
for log in results/pidstat*10000.txt; do
    if [[ $log = *"aggregate"* ]]; then
        name=$(echo $log | sed -r 's/[^\/]*\/[^\/]*\/pidstat-[0-9]*-([^\/]*)/\1/')
        cat $log | tail -n +2 | grep -v '^#' | grep -v "^$" | awk -v begin="$minimum" '{ printf("%d\t%d\n", $1 - begin, $7) }' | grep -v '^-' >> cpu-${name}
    fi
done
minf=$(mktemp)
for log in cpu*.txt; do
    cat $log | sort | head -n 1 $log | awk '{print $1}'  >> $minf
done
min=$(cat $minf | sort | head -n 1)
rm $minf
for log in cpu*.txt; do
    tmp=$(mktemp)
    cat $log | awk -v m="$min" ' { a[$1] += $2 } END { for (i in a) { printf "%s\t%s\n", (i - m), a[i]; } } ' > $tmp
    mv $tmp $log
done

join --nocheck-order -a1 -a2 -1 1 -2 1 -o 0,1.2,2.2 -e "0" \
    cpu-weaver-timestamper-aggregate-10000.txt \
    cpu-weaver-shard-aggregate-10000.txt \
    > cpu.txt
