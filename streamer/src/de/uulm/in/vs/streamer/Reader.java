package de.uulm.in.vs.streamer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.stream.Stream;

public class Reader implements Runnable {
    private final LinkedBlockingQueue<Event> queue;
    private String file;

    public Reader(LinkedBlockingQueue<Event> queue, String file) {
        this.queue = queue;
        this.file = file;
    }

    public void run() {
        try (Stream<String> stream = Files.lines(Paths.get(file))) {
            stream.forEach((line) -> {
                try {
                    String[] parsed = line.split(",", 3);

                    Command cmd = null;
                    switch (parsed[0]) {
                        case "CREATE_VERTEX":
                            cmd = Command.CREATE_VERTEX;
                            break;
                        case "REMOVE_VERTEX":
                            cmd = Command.REMOVE_VERTEX;
                            break;
                        case "UPDATE_VERTEX":
                            cmd = Command.UPDATE_VERTEX;
                            break;
                        case "CREATE_EDGE":
                            cmd = Command.CREATE_EDGE;
                            break;
                        case "REMOVE_EDGE":
                            cmd = Command.REMOVE_EDGE;
                            break;
                        case "UPDATE_EDGE":
                            cmd = Command.UPDATE_EDGE;
                            break;
                        case "CONTROL_EVENT":
                            cmd = Command.CONTROL_EVENT;
                            break;
                        case "MARKER_EVENT":
                            cmd = Command.MARKER_EVENT;
                            break;
                    }

                    long sourceVertex = -1;
                    long targetVertex = -1;
                    switch (cmd) {
                        case CONTROL_EVENT:
                        case MARKER_EVENT:
                            break;

                        case CREATE_VERTEX:
                        case REMOVE_VERTEX:
                        case UPDATE_VERTEX:
                            sourceVertex = Long.parseLong(parsed[1]);
                            targetVertex = sourceVertex;
                            break;

                        default:
                            String[] vertices = parsed[1].split("-", 2);
                            sourceVertex = Long.parseLong(vertices[0]);
                            targetVertex = Long.parseLong(vertices[1]);
                            break;
                    }

                    Event event = new Event(cmd, sourceVertex, targetVertex, parsed[2]);
                    queue.put(event);
                } catch (Throwable e) {
                    e.printStackTrace();
                }
            });

            try {
                queue.put(new Event(null, -1, -1, null));
                System.err.println("Reader: END");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
