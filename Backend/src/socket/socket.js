const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  });
};

const emitMatch = (userId) => {
  if (io) {
    io.emit("newMatch", userId);
  }
};

module.exports = { initSocket, emitMatch };