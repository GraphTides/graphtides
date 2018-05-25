package de.uulm.in.vs.streamer.evaluation;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.UUID;

public class Measure {
    public static void main(String[] args) throws IOException {
        if (args.length < 1) {
            System.err.println("Usage java -jar streamer-evaluation.jar OUTPUT_DIR [PORT]");
            System.exit(1);
        }

        String id = UUID.randomUUID().toString();
        ArrayList<Long> times = new ArrayList<>();

        Socket socket = null;
        InputStream input = System.in;

        if (args.length == 2) {
            ServerSocket serverSocket = new ServerSocket(Integer.parseInt(args[1]));
            socket = serverSocket.accept();
            input = socket.getInputStream();
            serverSocket.close();
        }

        boolean first = true;
        long start = -1;

        long numEvents = 0;
        BufferedReader reader = new BufferedReader(new InputStreamReader(input));
        for (String line; (line = reader.readLine()) != null; numEvents++) {
            long tmp = System.nanoTime();

            if (first) {
                start = tmp;
                first = false;
            }

            times.add(tmp - start);
        }
        long end = System.nanoTime();

        reader.close();
        input.close();
        if (socket != null) {
            socket.close();
        }

        long duration = (end - start);
        double eventRate = ((numEvents * 1e9) / (double) duration);

        Path resultsFile = Paths.get(args[0], "results.csv");

        if (!Files.exists(resultsFile)) {
            String output = "id,duration,#events,#events/s\n";
            output += id + "," + duration + "," + numEvents + "," + eventRate;
            Files.write(resultsFile, output.getBytes(), StandardOpenOption.CREATE);
        } else {
            String output = "\n" + id + "," + duration + "," + numEvents + "," + eventRate;
            Files.write(resultsFile, output.getBytes(), StandardOpenOption.APPEND);
        }

        try (PrintWriter writer = new PrintWriter(Paths.get(args[0], "times-" + id + ".csv").toFile())) {
            for (Long time : times) {
                writer.println(time);
            }
        }
    }
}
