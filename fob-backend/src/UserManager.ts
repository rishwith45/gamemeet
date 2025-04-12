import { Socket } from "socket.io";

interface User {
  socket: Socket;
  socketId: string;
}

export class UserManager {
  matchUsers: User[];
  users: User[];
  room: Map<string, string>;

  constructor() {
    this.matchUsers = [];
    this.users = [];
    this.room = new Map();
  }

  public addUser(user: User): void {
    console.log("user added");
    this.users.push(user);
    this.init(user);
    this.matchUsers.push(user);
    console.log(this.users.length);
    this.makeMatching();
  }

  public makeMatching(): void {
    if (this.matchUsers.length > 1) {
      let user1 = this.matchUsers.pop();
      let user2 = this.matchUsers.pop();
      if (user1?.socket.connected && user2?.socket.connected) {
        this.room.set(user1.socketId, user2.socketId);
        this.room.set(user2.socketId, user1.socketId);
        console.log("room created", user1.socketId, user2.socketId);
        user1.socket.emit("room-created", { oneOffers: true });
        user2.socket.emit("room-created", { oneOffers: false });
      }
    }
  }

  public init(user: User): void {
    user.socket.on("disconnect", () => {
      console.log("user disconnected in usermanager");
      this.users = this.users.filter((u) => u.socketId !== user.socketId);
    });
    user.socket.on("from-client", (data) => {
      const oppSocketId = this.room.get(user.socketId);
      const oppSocket = this.users.find(
        (value) => value.socketId === oppSocketId
      );

      if (oppSocket) {
        if (data.type === "description") {
          oppSocket.socket.emit("from-server", {
            type: "offer",
            offer: data.description,
          });
        } else {
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
  public timeout(user: User): void {
    setTimeout(() => {
      if (user?.socket?.connected) {
        user.socket.disconnect(); // Normal disconnect// Force close
        this.users = this.users.filter((u) => u.socketId !== user.socketId);
        this.matchUsers = this.matchUsers.filter(
          (u) => u.socketId !== user.socketId
        );
        this.room.delete(user.socketId);
        console.log("🔌 Forcefully disconnected after 30 seconds");
      }
    }, 30000);
  }
}
