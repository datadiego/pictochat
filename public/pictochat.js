const socket = io();

const inputSize = document.querySelector("#inputSize")

let brushSize = 10
let dragging = false;
// Desplazar la ventana de chat
const elemento = $('section')
  $( function() {
    $( "section" ).draggable({
        //handle: "#chat-titulo",
        start: function(){
            dragging = true;
        },
        stop: function(){
            dragging = false;
        }
    })
  } );

const updateChat = (mensajes) => {
  mensajes.forEach(msg => {
    const li = document.createElement("li")
    li.innerText = msg
    document.querySelector("ul").appendChild(li)
  
  })
}

const updateDraw = (puntos) => {
  puntos.forEach(punto => {
    layerDibujo.strokeWeight(punto.brushSize)
    layerDibujo.line(punto.x, punto.y, punto.pX, punto.pY)
  })
}

const updateSize = () => {
  brushSize = inputSize.value
  dragging = true; //evitamos que dibuje al usar el slider
}
inputSize.addEventListener("input", updateSize)
inputSize.addEventListener("change", () => dragging = false) //permitimos dibujar al soltar

fetch("/mensajes").then(res => res.json()).then(mensajes => updateChat(mensajes))
fetch("/puntos").then(res => res.json()).then(puntos => updateDraw(puntos) )
// Mostrar y ocultar el chat
function toggleChat(){
  const lista = document.querySelector("ul")
  const form = document.querySelector("form")
  lista.hidden = !lista.hidden;
  if(form.style.display === "none"){
    form.style.display = "flex";
  } else {
    form.style.display = "none"
  }
}

const form = document.querySelector("form")
form.addEventListener("submit", (e) => {
    e.preventDefault()
    const input = document.querySelector("#inputMensaje")
    const mensaje = input.value
    input.value = ""
    socket.emit("chat message", mensaje)
})

socket.on("chat message", (msg) => {
    const lista = document.querySelector("ul")
    const item = document.createElement("li")
    msg.startsWith("http") ? item.innerHTML = `<a href='${msg}'>${msg}</a>` : item.innerHTML = msg
    lista.appendChild(item)
});

socket.on("draw", (data) => {
    layerDibujo.strokeWeight(data.brushSize)
    layerDibujo.line(data.pX, data.pY, data.x, data.y)
})

let layerDibujo
let layerPuntero


function setup(){
    createCanvas(windowWidth, windowHeight)
    background(220)
    layerPuntero = createGraphics(width, height)
    layerPuntero.noFill()
    layerDibujo = createGraphics(width, height)
}

function draw(){
  background(220)
  layerPuntero.ellipse(mouseX, mouseY, brushSize)
  image(layerPuntero, 0, 0)
  layerPuntero.clear()
  image(layerDibujo, 0, 0)
  if(mouseIsPressed && !dragging){
    if(mouseX !== pmouseX || mouseY !== pmouseY){
      const posicion = {
        x: mouseX,
        y: mouseY,
        pX: pmouseX,
        pY: pmouseY,
        brushSize: brushSize
      }
      socket.emit("draw", posicion)
    }
  }
}
