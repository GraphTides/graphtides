package de.uulm.in.vs.streamer;

public class Event {
    public final Command command;
    public final long sourceVertex;
    public final long targetVertex;
    public final String payload;
    private final String json;

    public Event(Command command, long sourceVertex, long targetVertex, String payload) {
        this.command = command;
        this.sourceVertex = sourceVertex;
        this.targetVertex = targetVertex;
        this.payload = payload;

        if (command == null) {
            this.json = "";
        } else {
            switch (command) {
                case CREATE_VERTEX:
                case REMOVE_VERTEX:
                case UPDATE_VERTEX:
                    this.json = "{\"command\":\"" + command
                            + "\", \"targetVertex\": " + targetVertex
                            + ", \"payload\": " + payload + "} ";
                    break;

                default:
                    this.json = "{\"command\":\"" + command
                            + "\", \"sourceVertex\": " + sourceVertex
                            + ", \"targetVertex\": " + targetVertex
                            + ", \"payload\": " + payload + "} ";
            }
        }
    }

    public String toJSON() {
        return json;
    }
}
