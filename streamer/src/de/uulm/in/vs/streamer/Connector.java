package de.uulm.in.vs.streamer;

public interface Connector {
    public void onEvent(Event event);
    public void shutdown();
}
