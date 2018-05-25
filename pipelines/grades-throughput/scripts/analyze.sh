#!/bin/sh

cd /input/results

for connector in *; do
    for rate in $connector/*; do
        printf "$rate\t" >> /output/data-median-90perz.dat
        cat $rate/times-* | awk '{ print int($1/1e9) }' | uniq -c | sed '1d;$d' | sed '1d;$d' | awk '{ print $1 }' | datamash median 1 perc:10 1 max 1 >> /output/data-median-90perz.dat
    done
done

cat /output/data-median-90perz.dat | grep "^pipe" | sed 's/^pipe.//' | sort -n | sed 's/^/pipe\//' > /output/data-median-90perz-pipe.dat
cat /output/data-median-90perz.dat | grep "^tcp" | sed 's/^tcp.//' | sort -n | sed 's/^/tcp\//' > /output/data-median-90perz-tcp.dat
