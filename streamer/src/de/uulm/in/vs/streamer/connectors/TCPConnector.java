package de.uulm.in.vs.streamer.connectors;

import de.uulm.in.vs.streamer.Connector;
import de.uulm.in.vs.streamer.Event;

import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;

public class TCPConnector implements Connector {

    private Socket socket;
    private OutputStream output;

    public TCPConnector(String host, int port) throws IOException {
        socket = new Socket(host, port);
        socket.setTcpNoDelay(true);
        output = socket.getOutputStream();
    }

    @Override
    public void onEvent(Event event) {
        try {
            byte[] buffer = event.toJSON().getBytes();
            buffer[buffer.length - 1] = '\n';
            output.write(buffer);
            output.flush();
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    @Override
    public void shutdown() {
        try {
            output.close();
            socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
