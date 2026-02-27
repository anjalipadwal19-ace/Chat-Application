const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

// Storage
const users = new Map();
const rooms = {};

wss.on("connection", (ws) => {
  ws.isJoined = false;
  console.log("User connected");

  ws.on("message", (data) => {
    let msg;

    try {
      msg = JSON.parse(data);
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid data" }));
      return;
    }

    // ===== JOIN ROOM =====
    if (msg.type === "join") {

      if (!msg.username || !msg.room ||
        msg.username.trim() === "" ||
        msg.room.trim() === "") {

        ws.send(JSON.stringify({
          type: "error",
          message: "Invalid username or room"
        }));
        return;
      }

      // ✅ Unique username check
      for (const user of users.values()) {
        if (user.username === msg.username) {
          ws.send(JSON.stringify({
            type: "error",
            message: "Username already taken!"
          }));
          return;
        }
      }

      ws.isJoined = true;

      users.set(ws, {
        username: msg.username,
        room: msg.room
      });

      if (!rooms[msg.room])
        rooms[msg.room] = new Set();

      rooms[msg.room].add(ws);

      ws.send(JSON.stringify({ type: "joinSuccess" }));

      sendUserList(msg.room);
      sendRoomList();

      broadcast(msg.room, {
        type: "system",
        message: `${msg.username} joined the room`
      });
    }

    // ===== SWITCH ROOM =====
    else if (msg.type === "switchRoom") {

      const user = users.get(ws);
      if (!user) return;

      rooms[user.room]?.delete(ws);
      sendUserList(user.room);

      if (rooms[user.room]?.size === 0) {
        delete rooms[user.room];
        sendRoomList();
      }

      if (!rooms[msg.room])
        rooms[msg.room] = new Set();

      rooms[msg.room].add(ws);

      users.set(ws, {
        username: user.username,
        room: msg.room
      });

      sendUserList(msg.room);

      broadcast(msg.room, {
        type: "system",
        message: `${user.username} joined the room`
      });
    }

    // ===== CHAT MESSAGE =====
    else if (msg.type === "message") {

      const user = users.get(ws);
      if (!user || !msg.text?.trim()) return;

      broadcast(user.room, {
        type: "message",
        username: user.username,
        text: msg.text,
        time: new Date().toLocaleTimeString()
      });
    }

    // ===== TYPING =====
    else if (msg.type === "typing") {

      const user = users.get(ws);
      if (!user) return;

      rooms[user.room]?.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "typing",
            username: user.username
          }));
        }
      });
    }

    // ===== CREATE ROOM =====
    else if (msg.type === "createRoom") {

      if (!msg.room) return;

      if (!rooms[msg.room]) {
        rooms[msg.room] = new Set();
        sendRoomList();
      }
    }
  });

  // ===== HANDLE DISCONNECT =====
  ws.on("close", () => {
    if (!ws.isJoined) return;
    const user = users.get(ws);
    if (!user) return;

    // Remove from users map
    users.delete(ws);

    // Remove from room
    rooms[user.room]?.delete(ws);
    sendUserList(user.room);

    if (rooms[user.room]?.size === 0) {
      delete rooms[user.room];
      sendRoomList();
    }

    broadcast(user.room, { type: "system", message: `${user.username} left the room` });
  });
});

// ===== BROADCAST MESSAGE TO ROOM =====
function broadcast(room, data) {
  if (!rooms[room]) return;
  rooms[room].forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
  });
}

// ===== SEND ROOM LIST TO ALL =====
function sendRoomList() {
  const roomNames = Object.keys(rooms);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "rooms", rooms: roomNames }));
    }
  });
}

// ===== SEND USERS IN ROOM =====
function sendUserList(room) {
  if (!rooms[room]) return;
  const usersInRoom = [...rooms[room]].map(ws => users.get(ws)?.username).filter(Boolean);

  rooms[room].forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "users", users: usersInRoom }));
    }
  });
}

console.log("Server running at ws://localhost:3000");
