const http = require('http')
const WS = require('websocket').server
const { Mediator, MEDIATOR_CMDS } = require('./utils/Mediator')

const { WS_SERVER_PORT } = require('../common/constant')
const mediator = new Mediator()

const httpServer = http.createServer()
httpServer.listen(WS_SERVER_PORT, () => console.log(`Server is Listening on port ${WS_SERVER_PORT}`))

const server = new WS({ httpServer })
function originIsAllowed() { return true; }
server.on("request", async (request) => {
  if (!originIsAllowed(request.origin)) {
    request.reject()
    return;
  }

  let timerCollectAll;

  const connection = request.accept(null, request.origin)
  console.log(`Got connection request from ${request.origin}`)
  connection.on("message", (message) => {

  })
  connection.on("close", () => {
    mediator.handle(origin, MEDIATOR_CMDS["CLOSE"])
    mediator.close(origin)
    clearInterval(timerCollectAll)
  })


  function danmakuHandler(danmaku) {
    connection.sendUTF(JSON.stringify(danmaku))
  }

  const origin = request.origin
  await mediator.check(origin, danmakuHandler)
  await mediator.handle(origin, MEDIATOR_CMDS["CONNECT"], "https://www.douyu.com/537366")

  let time = new Date().getTime()
  timerCollectAll = setInterval(async () => {
    const count = await mediator.handle(origin, MEDIATOR_CMDS["COLLECT_ALL"])
    time += 10 * 1000
    console.log(new Date(time), count)
  }, 10 * 1000)

})


