import { Server } from "socket.io";
import http from "http";
import { UserManager } from "./UserManager";
const jwt = require("jsonwebtoken");
import express, { Request, Response, NextFunction } from "express";
const cors = require("cors");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT;
const MAX_TOKEN_REQUESTS_PER_MIN = 10;
const tokensPerMinute = new Map<string, number>();
const FRONTEND_URL = process.env.FRONTEND_URL;
const userManager = new UserManager();

setInterval(() => {
  tokensPerMinute.clear();
}, 30 * 1000);

const app = express();

app.use(cors({}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `${FRONTEND_URL}`,
  },
});

const rateLimitToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const ip = req.ip as string;

  const count = tokensPerMinute.get(ip) || 0;

  if (count >= MAX_TOKEN_REQUESTS_PER_MIN || userManager.room.size >= 500) {
    res.status(429).json({ error: "Too many token requests" });
    return;
  }

  tokensPerMinute.set(ip, count + 1);
  next();
};
app.use("/get-token", rateLimitToken);

app.get("/get-token", (req, res) => {
  const token = jwt.sign({ session: Date.now() }, JWT_SECRET, {
    expiresIn: "3m",
  });
  res.json({ token });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token as string;
  if (!token) return next(new Error("No token"));
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  userManager.addUser({ socket, socketId: socket.id });
  userManager.timeout({ socket, socketId: socket.id });

  socket.on("disconnect", () => {
    userManager.room.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
