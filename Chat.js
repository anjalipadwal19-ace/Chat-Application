// ================= Chat.js =================

let socket;
let currentRoom;
let username;
let typingTimeout;

// ================= Join a Chat Room =================
function joinRoom() {

    const joinBtn = document.getElementById("joinBtn");
    joinBtn.disabled = true;

    username = document.getElementById("username").value.trim();
    currentRoom = document.getElementById("room").value.trim();

    if (!username || !currentRoom) {
        alert("Please enter username and room");
        joinBtn.disabled = false;
        return;
    }

    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
        console.log("Connected");

        socket.send(JSON.stringify({
            type: "join",
            username,
            room: currentRoom
        }));
    };

    socket.onmessage = (event) => {

        const data = JSON.parse(event.data);

        switch (data.type) {

            //  MOVE UI CHANGE HERE SAFELY
            case "joinSuccess":

                document.querySelector(".login").style.display = "none";
                document.querySelector(".chat").classList.remove("hidden");

                addMessage(`Joined ${currentRoom}`, "system");
                joinBtn.disabled = false;
                break;

            case "message":
                const cls =
                    data.username === username
                        ? "message my-message"
                        : "message";

                addMessage(
                    `<b>${data.username}</b> (${data.time}): ${formatText(data.text)}`,
                    cls
                );
                break;

            case "system":
                addMessage(data.message, "system");
                break;

            case "rooms":
                updateRooms(data.rooms);
                break;

            case "users":
                updateUsers(data.users);
                break;

            case "error":
                alert(data.message);
                joinBtn.disabled = false;
                break;

            case "typing":
                showTyping(data.username);
                break;

            case "stopTyping":
                clearTyping();
                break;
        }
    };

    socket.onclose = (event) => {
        console.log("Closed:", event.code);
        joinBtn.disabled = false;
    };

    socket.onerror = () => {
        alert("Server connection failed");
        joinBtn.disabled = false;
    };
}

// ================= Send a Chat Message =================
function sendMessage() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text) return;

    socket.send(JSON.stringify({ type: "message", text }));

    input.value = "";
    clearTyping();
}

// ================= Create a New Room =================
function createRoom() {
    const room = document.getElementById("newRoom").value.trim();
    if (!room || !socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ type: "createRoom", room }));
    document.getElementById("newRoom").value = "";
}

// ================= Update Room List =================
function updateRooms(rooms) {
    const list = document.getElementById("roomList");
    list.innerHTML = "";

    rooms.forEach(room => {
        const li = document.createElement("li");
        li.textContent = room;
        li.style.cursor = "pointer";

        li.onclick = () => {
            document.querySelectorAll(".rooms li").forEach(el => el.classList.remove("active"));
            li.classList.add("active");

            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "switchRoom", room }));
                currentRoom = room;
                document.getElementById("messages").innerHTML = "";
                addMessage(`You joined room: ${room}`, "system");
            }
        };

        list.appendChild(li);
    });
}

// ================= Update Users List =================
function updateUsers(users) {
    const list = document.getElementById("userList");
    list.innerHTML = "";

    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        list.appendChild(li);
    });
}

// ================= Add Message to Chat Window =================
function addMessage(text, cls = "message") {
    const messages = document.getElementById("messages");

    const isAtBottom = messages.scrollHeight - messages.scrollTop <= messages.clientHeight + 50;

    const div = document.createElement("div");
    div.className = cls;
    div.innerHTML = text;

    messages.appendChild(div);

    if (isAtBottom) {
        messages.scrollTop = messages.scrollHeight;
    }
}

// ================= Format Message Text =================
function formatText(text) {
    const div = document.createElement('div');
    div.textContent = text;

    return div.innerHTML
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

// ================= Typing Indicator =================
function showTyping(user) {
    const typingEl = document.getElementById("typing");
    typingEl.textContent = `${user} is typing...`;
}

function clearTyping() {
    const typingEl = document.getElementById("typing");
    typingEl.textContent = "";
}

// ================= Theme Toggle & Input Listeners =================
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");

    // Load saved theme
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggle.textContent = savedTheme === "light" ? "☀️" : "🌙";

    themeToggle.onclick = () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        themeToggle.textContent = newTheme === "light" ? "☀️" : "🌙";
        localStorage.setItem("theme", newTheme);
    };

    // Typing indicator and Enter key
    const messageInput = document.getElementById("messageInput");

    messageInput.addEventListener("input", () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        socket.send(JSON.stringify({ type: "typing" }));

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.send(JSON.stringify({ type: "stopTyping" }));
        }, 1000);
    });

    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});