# Real-Time Chat Application

Project Overview
This project is a Real-Time Chat Application developed using HTML, CSS, JavaScript, and WebSocket technology.
The application allows multiple users to communicate instantly by joining chat rooms. Users can create rooms, send messages, view active users, and experience live messaging with typing indicators.
The system provides smooth real-time communication along with a modern responsive user interface supporting both dark and light themes.
________________________________________
Files in the Project
• Chat.html – Creates the structure of the chat application
• Chat.css – Provides styling, animations, and responsive design
• Chat.js – Handles client-side chat functionality and WebSocket communication
• Server.js – Manages WebSocket server, rooms, users, and message broadcasting
________________________________________
How to Run the Application
Step 1: Install Requirements
1.	Install Node.js on your system.
2.	Open the project folder in terminal or command prompt.
Step 2: Install WebSocket Dependency
Run the following command:
npm install ws
Step 3: Start the Server
Run:
node Server.js
Server will start at:
ws://localhost:3000
Step 4: Run the Chat Application
1.	Open Chat.html in any web browser.
2.	Enter:
o	Username
o	Room Name
3.	Click Join to enter the chat room.
4.	Start sending messages in real time.
________________________________________
Application Features
• Real-time messaging using WebSockets
• Multiple chat rooms support
• Create and switch between rooms
• Live user list display
• Typing indicator functionality
• Unique username validation
• Dark mode and Light mode toggle
• Message formatting support:
•	Bold text
•	Italic text
•	Clickable links
• Responsive design for mobile and desktop devices
• Smooth animations and modern UI
________________________________________
Explanation of Code
HTML
HTML is used to design:
•	Login screen
•	Chat interface
•	Room and user panels
•	Message input area
It defines the overall structure of the chat system.
CSS
CSS provides:
•	Modern glass morphism UI design
•	Dark and light themes
•	Animations and transitions
•	Responsive layout for different screen sizes
JavaScript (Client Side)
JavaScript manages:
•	WebSocket connection
•	Sending and receiving messages
•	Room switching
•	Typing indicators
•	Theme switching using local storage
•	Dynamic message display
Node.js Server (Server.js)
The server handles:
•	User connections
•	Room creation and management
•	Message broadcasting
•	User join and leave events
•	Real-time updates of users and rooms
________________________________________
Testing
The application was tested for:
• Successful user connection
• Multiple users chatting simultaneously
• Room creation and switching
• Message delivery in real time
• Typing indicator functionality
• Username uniqueness validation
• Proper handling of user disconnects
• Theme toggle persistence
________________________________________
Conclusion
This project demonstrates how frontend and backend technologies work together to build a real-time communication system.
It helped in understanding:
•	WebSocket communication
•	Client–server architecture
•	Real-time data handling
•	Dynamic UI updates
•	Modern responsive web design
The project improves knowledge of real-time web applications and interactive system development.



