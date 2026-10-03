import "dotenv/config";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4000);
const app = createApp();
const server = createServer(app);

// Real-time: each logged-in user joins a room named after their user id.
// Routes emit "wallet:updated" to that room when money arrives.
const io = new Server(server, { cors: { origin: "*" } });
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    const payload = jwt.verify(token ?? "", process.env.JWT_SECRET ?? "dev-secret") as { sub: string };
    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("unauthorized"));
  }
});
io.on("connection", (socket) => socket.join(socket.data.userId));
app.set("io", io);

server.listen(port, () => console.log(`Wallet API on http://localhost:${port}`));
