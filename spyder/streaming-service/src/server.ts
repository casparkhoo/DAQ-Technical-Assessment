import net from "net";
import { WebSocket, WebSocketServer } from "ws";

interface VehicleData {
  battery_temperature: number | string;
  timestamp: number;
}

const TCP_PORT = 12000;
const WS_PORT = 8080;
const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: WS_PORT });

const SAFE_TEMP_RANGE = { min: 20, max: 80 };
const ALERT_THRESHOLD = 3;
const TIME_WINDOW = 5000;
let outOfRangeTimestamps: number[] = [];

tcpServer.on("connection", (socket) => {
  console.log("TCP client connected");

  socket.on("data", (msg) => {
    const message: string = msg.toString();

    try {
      const data: VehicleData = JSON.parse(message);
      if (typeof data.battery_temperature !== "number" || isNaN(data.battery_temperature)) {
        console.log(`Invalid data received: ${message}`);
        return;
      }

      const now = Date.now();
      if (
        data.battery_temperature < SAFE_TEMP_RANGE.min ||
        data.battery_temperature > SAFE_TEMP_RANGE.max
      ) {
        outOfRangeTimestamps.push(now);

        // Remove timestamps older than TIME_WINDOW
        outOfRangeTimestamps = outOfRangeTimestamps.filter(
          (t) => now - t <= TIME_WINDOW
        );

        // Check if the alert threshold is exceeded
        const isWarning = outOfRangeTimestamps.length > ALERT_THRESHOLD;

        // Log warning if threshold is exceeded
        if (isWarning) {
          console.warn(
            `Battery temperature out of range more than ${ALERT_THRESHOLD} times in ${TIME_WINDOW / 1000}s!`
          );
        }

        // Send JSON over WS to frontend clients with warning status
        const responseData = {
          ...data,
          warning: isWarning, // Add warning status to the message
        };

        websocketServer.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(responseData)); // Send the updated message
          }
        });

        console.log(`Received: ${message}`);
      } else {
        // If the temperature is within range, send the data without warning
        const responseData = {
          ...data,
          warning: false, // No warning if within range
        };

        websocketServer.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(responseData)); // Send the updated message
          }
        });
      }
    } catch (error) {
      console.log(`Failed to parse JSON: ${message}`);
    }
  });

  socket.on("end", () => {
    console.log("Closing connection with the TCP client");
  });

  socket.on("error", (err) => {
    console.log("TCP client error: ", err);
  });
});

websocketServer.on("listening", () =>
  console.log(`Websocket server started on port ${WS_PORT}`)
);

websocketServer.on("connection", async (ws: WebSocket) => {
  console.log("Frontend websocket client connected");
  ws.on("error", console.error);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});