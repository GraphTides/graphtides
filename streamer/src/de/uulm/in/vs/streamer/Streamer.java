package de.uulm.in.vs.streamer;

import java.util.concurrent.LinkedBlockingQueue;

public class Streamer implements Runnable {
    private final LinkedBlockingQueue<Event> queue;
    private final Connector connector;
    private final long baseDelay;
    private long delay;

    public Streamer(LinkedBlockingQueue<Event> queue, Connector connector, long eventRate) {
        this.queue = queue;
        this.connector = connector;

        if (eventRate > 0) {
            // convert evts/second to cycle duration in ns
            this.baseDelay = (long) (1e9 / (double) eventRate) - 500;
        } else {
            // best effort
            this.baseDelay = 0;
        }

        this.delay = this.baseDelay;
    }

    @Override
    public void run() {
        long next = 0;
        while (true) {
            while (System.nanoTime() < next) { }
            next = System.nanoTime() + delay;
            try {
                Event event = queue.take();

                if (event.command == null) {
                    System.err.println("Streamer: END");
                    break;
                } else if (event.command == Command.CONTROL_EVENT) {
                    if (event.payload.startsWith("PAUSE")) {
                        // pause event stream for specified time
                        next += Long.parseLong(event.payload.substring(6));
                    } else if (event.payload.startsWith("RATE")) {
                        // adjust rate, based on factor of base rate
                        delay = (long) ((double) baseDelay / Double.parseDouble(event.payload.substring(5)));
                    }

                    // skip command events
                    continue;
                }

                connector.onEvent(event);
            } catch(InterruptedException e) {
                e.printStackTrace();
            }
        }
        connector.shutdown();
    }
}
