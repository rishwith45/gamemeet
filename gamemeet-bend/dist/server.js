"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const UserManager_1 = require("./UserManager");
const jwt = require("jsonwebtoken");
const express_1 = __importDefault(require("express"));
const cors = require("cors");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT;
const MAX_TOKEN_REQUESTS_PER_MIN = 10;
const tokensPerMinute = new Map();
const FRONTEND_URL = process.env.FRONTEND_URL;
const userManager = new UserManager_1.UserManager();
console.log("Frontend URL:", FRONTEND_URL);
setInterval(() => {
    console.log("Clearing ips");
    tokensPerMinute.clear();
}, 30 * 1000);
const app = (0, express_1.default)();
app.use(cors({}));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const rateLimitToken = (req, res, next) => {
    const ip = req.ip;
    console.log(ip);
    console.log(userManager.matchUsers.length);
    console.log(userManager.users.length);
    console.log(userManager.room.size);
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
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error("No token"));
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    }
    catch (err) {
        next(new Error("Invalid token"));
    }
});
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    userManager.addUser({ socket, socketId: socket.id });
    userManager.timeout({ socket, socketId: socket.id });
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        userManager.room.delete(socket.id);
    });
});
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
