package de.uulm.in.vs.streamer.connectors;

import de.uulm.in.vs.streamer.Connector;
import de.uulm.in.vs.streamer.Event;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.UUID;
import java.util.concurrent.ExecutorService;

public class ChronographConnector implements Connector {

    private int count;
    private String actor;
    private Socket socket;
    private OutputStream output;
    private BufferedReader reader;
    private PrintWriter writer;

    public ChronographConnector(int port) throws IOException {
        ServerSocket serverSocket = new ServerSocket(port);
        socket = serverSocket.accept();
        socket.setTcpNoDelay(true);

        output = socket.getOutputStream();
        reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

        writer = new PrintWriter(new File("streamer-log.txt"));

        String line = reader.readLine();
        actor = line.substring(11, 47);
    }

    @Override
    public void onEvent(Event event) {
        try {
            String actor = this.actor;
            String payload;
            int suffix;

            switch (event.command) {
                case REMOVE_VERTEX:
                case UPDATE_VERTEX:
                    actor = UUID.nameUUIDFromBytes(("vertex" + event.targetVertex).getBytes()).toString();
                    suffix = Integer.parseInt(actor.substring(actor.length() - 2), 2);
                    if (suffix % 4 == 3 || suffix % 4 == 0) {
                        actor = actor.substring(0, actor.length() - 2) + "0" + (suffix % 2 + 1);
                    }
                    payload = "{\"command\":\"" + event.command
                            + "\", \"targetVertex\": \"vertex" + event.targetVertex
                            + "\", \"payload\": " + event.payload + "} ";
                    break;

                case CREATE_EDGE:
                case REMOVE_EDGE:
                case UPDATE_EDGE:
                    actor = UUID.nameUUIDFromBytes(("vertex" + event.sourceVertex).getBytes()).toString();
                    suffix = Integer.parseInt(actor.substring(actor.length() - 2), 2);
                    if (suffix % 4 == 3 || suffix % 4 == 0) {
                        actor = actor.substring(0, actor.length() - 2) + "0" + (suffix % 2 + 1);
                    }

                    payload = "{\"command\":\"" + event.command
                            + "\", \"sourceVertex\": \"vertex" + event.sourceVertex
                            + "\", \"targetVertex\": \"vertex" + event.targetVertex
                            + "\", \"payload\": " + event.payload + "} ";
                    break;

                default:
                    payload = event.toJSON();
                    break;
            }

            String message = "{ \"receiver\": \"" + actor + "\", \"payload\": " + payload + "}\n";
            output.write(message.getBytes());
            output.flush();
            count += 1;

            writer.println(System.currentTimeMillis());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void shutdown() {
        System.out.println(count + " events streamed");
        try {
            writer.close();
            reader.close();
            output.close();
            socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
