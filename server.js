import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
  const files = {
    "/": { path: "./public/index.html", contentType: "text/html" },
    "/index.html": { path: "./public/index.html", contentType: "text/html" },
    "/script.js": {
      path: "./public/script.js",
      contentType: "text/javascript",
    },
  };
  const file = files[req.url];

  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  fs.readFile(file.path, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading page");
      return;
    }
    res.writeHead(200, { "Content-Type": file.contentType });
    res.end(data);
  });
});

function broadcast(message) {
    for(const client of wss.clients){
        if(client.readyState === 1){
            client.send(JSON.stringify(message));
        }
    }
}

const wss = new WebSocketServer({server});

wss.on("connection", (socket, req) => {
    const username = new URL(
        req.url,
        "http://localhost"
    ).searchParams.get("username");
  
    broadcast({
        type:"system",
        text: `${username} joined`
    })

    socket.on("message",(data) => {
        const message = JSON.parse(data.toString());

        broadcast({
            type:"chat",
            username: message.username,
            text: message.text
        })
    });
    socket.on("close",(data) => {
        broadcast({
            type:"system",
            text: `${username} left`
        })
    })
    ;socket.on("error",(err) => {
        console.log("Socket error:", err.message);
    })
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});




