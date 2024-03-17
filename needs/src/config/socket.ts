import { Server } from "socket.io";

const io = new Server();
const userSocketMap = new Map();

io.on("connection", (socket) => {
  io.emit("welcome", "hello");
  socket.on("login", (userId) => {
    // Store the user's socket ID in the map
    userSocketMap.set(userId, socket.id);
    io.emit("getUsers", userSocketMap);
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });
  socket.on("sendMessage", (userId, receiverId, body) => {
    const receiverSocketId = userSocketMap.get(receiverId);
    io.to(receiverSocketId).emit("getMessage", { userId, body });
  });
  console.log("a user connected");
  socket.on("disconnect", () => {
    userSocketMap.forEach((value, key) => {
      if (value === socket.id) {
        userSocketMap.delete(key);
        console.log(`User ${key} disconnected`);
      }
      io.emit("getUsers", userSocketMap);
    });
    console.log("user disconnected");
  });
});

export { io, userSocketMap };
