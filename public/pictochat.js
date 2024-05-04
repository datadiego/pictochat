const socket = io();

const inputSize = document.querySelector("#inputSize")
const inputColor = document.querySelector("#inputColor")
const inputBackground = document.querySelector("#inputBackground")
const form = document.querySelector("form")
const elemento = $('section')

let layerDibujo
let layerPuntero
let brushSize = inputSize.value
let dragging = false;
let backgroundColor = "#AAAAAA"

const draggableElements = () => {
  $( function() {
    $( "section" ).draggable({
        start: function(){
            dragging = true;
        },
        stop: function(){
            dragging = false;
        }
    })
  } );
}

document.addEventListener("DOMContentLoaded", draggableElements)

const updateChat = (mensajes) => {
  mensajes.forEach(msg => {
    const li = document.createElement("li")
    li.innerText = msg
    document.querySelector("ul").appendChild(li)
  
  })
}
const updateDraw = (puntos) => {
  puntos.forEach(punto => {
    console.log(punto)
    backgroundColor = punto.backgroundColor
    inputBackground.value = backgroundColor
    layerDibujo.stroke(punto.colorFront)
    layerDibujo.strokeWeight(punto.brushSize)
    layerDibujo.line(punto.x, punto.y, punto.pX, punto.pY)
  })
}
const updateSize = () => {
  brushSize = inputSize.value
  layerDibujo.strokeWeight(brushSize)
  strokeWeight(brushSize)
  console.log(brushSize)
  dragging = true; //evitamos que dibuje al usar el slider
}
const updateColor = () => {
  dragging = true; 
  layerDibujo.stroke(inputColor.value)
  stroke(inputColor.value)
}
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
function toggleHerramientas(){
  const ui = document.querySelector("#herramientas-ui")
  if(ui.style.display === "none"){
    ui.style.display = "flex"
  } else {
    ui.style.display = "none"
  }
}
const enviaMensaje = (e) => {
  e.preventDefault()
  const input = document.querySelector("#inputMensaje")
  const mensaje = input.value
  input.value = ""
  socket.emit("chat message", mensaje)
}
const updateBackground = () => {
  console.log(inputBackground.value)
  backgroundColor = inputBackground.value
  const posicion = {
    x: -100,
    y: -100,
    pX: -100,
    pY: -100,
    brushSize: 1,
    colorFront: inputColor.value,
    backgroundColor: inputBackground.value
  }
  socket.emit("draw", posicion)
}

inputSize.addEventListener("input", updateSize)
inputSize.addEventListener("change", () => dragging = false) //permitimos dibujar al soltar
inputColor.addEventListener("input", updateColor)
inputColor.addEventListener("change", () => dragging = false)
inputBackground.addEventListener("input", updateBackground)
form.addEventListener("submit", enviaMensaje)

fetch("/mensajes").then(res => res.json()).then(mensajes => updateChat(mensajes))
fetch("/puntos").then(res => res.json()).then(puntos => updateDraw(puntos))

const nuevoMensaje = (msg) => {
  const lista = document.querySelector("ul")
  const item = document.createElement("li")
  msg.startsWith("http") ? item.innerHTML = `<a href='${msg}'>${msg}</a>` : item.innerHTML = msg
  lista.appendChild(item)
}
socket.on("chat message", nuevoMensaje);

socket.on("draw", (data) => {
  inputBackground.value = data.backgroundColor
  backgroundColor = data.backgroundColor
  layerDibujo.line(data.pX, data.pY, data.x, data.y)
})



function setup(){
    createCanvas(windowWidth, windowHeight)
    background(backgroundColor)
    layerPuntero = createGraphics(width, height)
    layerPuntero.noFill()
    layerDibujo = createGraphics(width, height)
}

function draw(){
  background(backgroundColor)
  if(mouseIsPressed && !dragging){
    if(mouseX !== pmouseX || mouseY !== pmouseY){
      const posicion = {
        x: mouseX,
        y: mouseY,
        pX: pmouseX,
        pY: pmouseY,
        brushSize: brushSize,
        colorFront: inputColor.value,
        backgroundColor: backgroundColor
      }
      socket.emit("draw", posicion)
    }
  }

  layerPuntero.clear()
  layerPuntero.ellipse(mouseX, mouseY, brushSize)
  image(layerPuntero, 0, 0)
  image(layerDibujo, 0, 0)
}
