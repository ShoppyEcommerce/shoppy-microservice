import { Server } from "socket.io";

const io = new Server();

io.on("connection", (socket) => {
  io.emit("welcome", "hello");
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

export { io };
