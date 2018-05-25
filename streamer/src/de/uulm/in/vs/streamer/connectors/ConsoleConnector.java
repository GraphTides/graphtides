package de.uulm.in.vs.streamer.connectors;

import de.uulm.in.vs.streamer.Connector;
import de.uulm.in.vs.streamer.Event;

public class ConsoleConnector implements Connector {
    @Override
    public void onEvent(Event event) {
        System.out.println(event.toJSON());
    }

    @Override
    public void shutdown() {
    }
}
