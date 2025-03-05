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
const WARNING_RANGE = { min: 25, max: 75 };
const ALERT_THRESHOLD = 3;
const TIME_WINDOW = 5000;
let outOfRangeTimestamps: number[] = [];

tcpServer.on("connection", (socket) => {
  console.log("TCP client connected");

  socket.on("data", (msg) => {
    const message: string = msg.toString();

    try {
      const data: VehicleData = JSON.parse(message);
      if (typeof data.battery_temperature !== "number" ||
      isNaN(data.battery_temperature)) {
        console.log(`Invalid data received: ${message}`);
        return;
      }

      if (
        data.battery_temperature < SAFE_TEMP_RANGE.min ||
        data.battery_temperature > SAFE_TEMP_RANGE.max
      ) {
        const now = Date.now();
        outOfRangeTimestamps.push(now);

        // Remove timestamps older than TIME_WINDOW
        outOfRangeTimestamps = outOfRangeTimestamps.filter(
          (t) => now - t <= TIME_WINDOW
        );

        // Log warning if threshold is exceeded
        if (outOfRangeTimestamps.length > ALERT_THRESHOLD) {
          console.warn(
            `[ALERT] Battery temperature out of range more than ${ALERT_THRESHOLD} times in ${TIME_WINDOW / 1000}s! Last timestamp: ${now}`
          );
        }

        console.log(`Received: ${message}`);
      }

      // Send JSON over WS to frontend clients
      websocketServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
          // update status from green to yellow to red here?
        }
      });
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
