const socket = io();

let draggingChat = false;
// Desplazar la ventana de chat
const elemento = $('section')
  $( function() {
    $( "section" ).draggable({
        //handle: "#chat-titulo",
        start: function(){
            draggingChat = true;
            console.log("dragging")
        },
        stop: function(){
            draggingChat = false;
            console.log("stopped")
        }
    })
  } );

const updateChat = (mensajes) => {
  console.log(mensajes)
  mensajes.forEach(msg => {
    const li = document.createElement("li")
    li.innerText = msg
    document.querySelector("ul").appendChild(li)
  
  })
}

fetch("/mensajes").then(res => res.json()).then(mensajes => updateChat(mensajes))

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

socket.on("init dibujo", (lineas) => {
  console.log(lineas)
  lineas.forEach(linea => line(linea.x, linea.y, linea.pX, linea.pY))
})

socket.on("chat message", (msg) => {
    const lista = document.querySelector("ul")
    const item = document.createElement("li")
    msg.startsWith("http") ? item.innerHTML = `<a href='${msg}'>${msg}</a>` : item.innerHTML = msg
    lista.appendChild(item)
});

socket.on("draw", (data) => {
    line(data.pX, data.pY, data.x, data.y)
})

function setup(){
    createCanvas(windowWidth, windowHeight)
    background(220)
}

function draw(){
    if(mouseIsPressed && !draggingChat){
        //draw only if mouse moves
        if(mouseX !== pmouseX || mouseY !== pmouseY){
        //line(pmouseX, pmouseY, mouseX, mouseY)
        const posicion = {
            x: mouseX,
            y: mouseY,
            pX: pmouseX,
            pY: pmouseY
        }
        socket.emit("draw", posicion)
        }
    }
}
