const http = require('http')
const WS = require('websocket').server

const { WS_SERVER_PORT } = require('../common/constant')


const httpServer = http.createServer()
httpServer.listen(WS_SERVER_PORT, () => console.log(`Server is Listening on port ${WS_SERVER_PORT}`))

const server = new WS({ httpServer })
function originIsAllowed(origin) { return true; }
server.on("request", async (request) => {
  if (!originIsAllowed(request.origin)) {
    request.reject()
    return;
  }

  const connection = request.accept(null, request.origin)
  console.log(`Got connection request from ${request.origin}`)
  connection.on("message", (message) => {

  })
})



function danmakuHandler(danmaku) {
  counter.increaseDanmakuCount()
  counter.increaseKeywordCount(danmaku.msg)

}

