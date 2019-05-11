const http = require('http')
const WS = require('websocket').server
const { Mediator, MEDIATOR_CMDS } = require('./utils/Mediator')

const { WS_SERVER_PORT } = require('../common/constant')
const mediator = new Mediator()
mediator.init().then(() => {
  const httpServer = http.createServer()
  httpServer.listen(WS_SERVER_PORT, () => console.log(`Server is Listening on port ${WS_SERVER_PORT}`))
  
  const server = new WS({ httpServer })
  let clientIDBase = Math.random()
  server.on("request", async (request) => {
    let connection = request.accept(null, request.origin)
    console.log(`Got connection request from ${request.origin}`)
  
    clientIDBase += 5 / 1000000
    const clientID = clientIDBase.toString(32)
    mediator.handle(MEDIATOR_CMDS["NEW_CLIENT"], clientID, connection)
  })
}).catch(err => {
  console.log(err)
  throw err
})



