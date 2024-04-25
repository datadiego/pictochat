const fs = require("fs")
const path = require("path")
const dbpath = path.join(__dirname, "../db/mensajes.db")
const sqlite = require("better-sqlite3")
const db = new sqlite(dbpath)

function initDB(){
    const init = fs.readFileSync(path.join(__dirname, "../db/init.sql"), "utf8")
    const statements = init.split(";").filter( statement => statement.trim() !== "")
    statements.forEach(statement => {
        db.prepare(statement).run()
    })
}

function readAll(){
    //const statement = db.prepare("SELECT * FROM mensajes ORDER BY id DESC LIMIT 5 ").all()
    return db.prepare("SELECT * FROM mensajes").all();
}

function insertMensaje(mensaje){
    const statement = db.prepare("INSERT INTO mensajes (mensaje) VALUES (?)")
    statement.run(mensaje)
}

function insertPoints(data){
    const statement = db.prepare("INSERT INTO lineas (x, y, pX, pY) VALUES (?, ?, ?, ?)").run(data.x, data.y, data.pX, data.pY);
}

function getPoints(){
    return db.prepare("SELECT * FROM lineas").all();
}

module.exports = {
    initDB,
    readAll,
    insertMensaje,
    insertPoints,
    getPoints
}

