package de.uulm.in.vs.streamer;

import de.uulm.in.vs.streamer.connectors.ChronographConnector;
import de.uulm.in.vs.streamer.connectors.ConsoleConnector;
import de.uulm.in.vs.streamer.connectors.TCPConnector;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService threadPool = Executors.newFixedThreadPool(2);
        LinkedBlockingQueue<Event> queue = new LinkedBlockingQueue<>();

        Connector connector = null;

        if (args.length < 3) {
            System.err.println("Usage: java -jar workload-streamer.jar WORKLOAD REPLAY_RATE CONNECTOR [PARAMS]");
            System.exit(1);
        }

        switch (args[2]) {
            case "ChronographConnector":
                connector = new ChronographConnector(Integer.parseInt(args[3]));
                break;

            case "TCPConnector":
                connector = new TCPConnector(args[3], Integer.parseInt(args[4]));
                break;

            case "ConsoleConnector":
                connector = new ConsoleConnector();
                break;

            default:
                System.err.println("Error: invalid connector");
                System.exit(1);
        }

        threadPool.submit(new Reader(queue, args[0]));
        threadPool.submit(new Streamer(queue, connector, Long.parseLong(args[1])));

        threadPool.shutdown();
    }
}
