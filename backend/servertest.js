const http = require('http')
const WS = require('websocket').server


const httpServer = http.createServer()
httpServer.listen(8080, () => console.log("listening..."))

const server = new WS({
  httpServer,
})

server.on("request", (request) => {
  const connection = request.accept(null, request.origin)
  connection.on("message", () => console.log(666))

  connection.on("close", () => console.log("closed"))
})