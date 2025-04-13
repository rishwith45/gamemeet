"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
class UserManager {
    constructor() {
        this.matchUsers = [];
        this.users = [];
        this.room = new Map();
    }
    addUser(user) {
        this.users.push(user);
        this.init(user);
        this.matchUsers.push(user);
        console.log(this.users.length);
        this.makeMatching();
    }
    makeMatching() {
        if (this.matchUsers.length > 1) {
            let user1 = this.matchUsers.pop();
            let user2 = this.matchUsers.pop();
            if ((user1 === null || user1 === void 0 ? void 0 : user1.socket.connected) && (user2 === null || user2 === void 0 ? void 0 : user2.socket.connected)) {
                this.room.set(user1.socketId, user2.socketId);
                this.room.set(user2.socketId, user1.socketId);
                user1.socket.emit("room-created", { oneOffers: true });
                user2.socket.emit("room-created", { oneOffers: false });
            }
        }
    }
    init(user) {
        user.socket.on("disconnect", () => {
            this.users = this.users.filter((u) => u.socketId !== user.socketId);
        });
        user.socket.on("from-client", (data) => {
            const oppSocketId = this.room.get(user.socketId);
            const oppSocket = this.users.find((value) => value.socketId === oppSocketId);
            if (oppSocket) {
                if (data.type === "description") {
                    oppSocket.socket.emit("from-server", {
                        type: "offer",
                        offer: data.description,
                    });
                }
                else {
                    oppSocket.socket.emit("from-server", {
                        type: "candidate",
                        data: data.candidate,
                    });
                }
            }
        });
        user.socket.on("connection success", () => {
            this.users = this.users.filter((u) => u.socketId !== user.socketId);
            this.room.delete(user.socketId);
        });
    }
    timeout(user) {
        setTimeout(() => {
            var _a;
            if ((_a = user === null || user === void 0 ? void 0 : user.socket) === null || _a === void 0 ? void 0 : _a.connected) {
                user.socket.disconnect(); // Normal disconnect// Force close
                this.users = this.users.filter((u) => u.socketId !== user.socketId);
                this.matchUsers = this.matchUsers.filter((u) => u.socketId !== user.socketId);
                this.room.delete(user.socketId);
            }
        }, 30000);
    }
}
exports.UserManager = UserManager;
