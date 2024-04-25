const path = require("path")
const express = require("express");
const { createServer } = require("http");
const { join } = require("path");
const { Server } = require("socket.io");
const {initDB, readAll, insertMensaje, insertPoints, getPoints} = require("./scripts/model.js")
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Pictochat!");
})

app.get("/reset", (req, res) => {
    initDB()
    res.send("Base de datos reseteada")  
})

io.on("connection", (socket) => {
    console.log("Usuario conectado");
    const mensajes = readAll(); //recupera mensajes antiguos
    io.emit("init chat", mensajes) //envialos
    const lineas = getPoints()
    io.emit("init dibujo", lineas)
    socket.on("chat message", (msg) => {
        insertMensaje(msg)
        io.emit("chat message", msg);
    });

    socket.on("draw", (data) => {
        insertPoints(data)
        io.emit("draw", data);
    });
});

server.listen(port, () => {
    console.log(`Servidor lanzado en el puerto ${port}`)
})