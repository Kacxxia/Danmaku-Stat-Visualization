const { Mediator, MEDIATOR_CMDS } = require('../index')
const Client = require('./Client')
const mediator = new Mediator()

const { CMD_CONNECT, CMD_DANMAKU, CMD_COLLECT, CMD_SPEED, CMD_STATS } = require('../../../../common/constant')
class ClientsManager {
  constructor() {
    this.clients = {}

    this.createClient = this.createClient.bind(this)
    this.handleClient = this.handleClient.bind(this)
    this.connectSucceedSingle = this.connectSucceedSingle.bind(this)
    this.connectFailedSingle = this.connectFailedSingle.bind(this)
    this.connectSucceed = this.connectSucceed.bind(this)
    this.connectFailed = this.connectFailed.bind(this)
    this.handleDanmaku = this.handleDanmaku.bind(this)
    this.handleSpeed = this.handleSpeed.bind(this)
    this.removeClient = this.removeClient.bind(this)
  }

  handleClient(clientID, entity) {
    console.log(entity)
    const msg = JSON.parse(entity)
    switch (msg.type) {
      case CMD_CONNECT:
        this.clients[clientID].switchStatusToClosed()
        this.clients[clientID].url = msg.payload
        mediator.handle(MEDIATOR_CMDS["SUBSCRIBE"], msg.payload, clientID)
        mediator.handle(MEDIATOR_CMDS["CONNECT_DANMAKU_SERVER"], msg.payload)
        break;
      case CMD_COLLECT:
        mediator.handle(MEDIATOR_CMDS["COLLECT"], this.clients[clientID].url)
        break;
      default:
        console.warn("ClientsManager: Unknown cmd from frontend", msg.type)
    }
  }

  createClient(clientID, connection) {
    this.clients[clientID] = new Client(clientID, connection)
    connection.on("message", (entity) => this.handleClient(clientID, entity.utf8Data))
    connection.on("close", () => {
      mediator.handle(MEDIATOR_CMDS["REMOVE_CLIENT"], this.clients[clientID].url, clientID)
      this.removeClient(clientID)
      connection = null
    })
  }

  connectSucceedSingle(clientID) {
    this.clients[clientID].switchStatusToConnected()
    this.clients[clientID].send(CMD_CONNECT, { code: 200 })
    mediator.handle(MEDIATOR_CMDS["QUERY_STATS"], clientID)
  }

  connectSucceed(clientIDs) {
    clientIDs.forEach(id => {
      if (this.clients[id] && this.clients[id].danmakuConnectStatus === "closed") {
        this.connectSucceedSingle(id)
      }
    })
  }

  connectFailedSingle(clientID) {
    this.clients[clientID].switchStatusToFailed()
    this.clients[clientID].send(CMD_CONNECT, { code: 500 })
  }

  connectFailed(clientIDs) {
    clientIDs.forEach(id => {
      if (this.clients[id] && this.clients[id].danmakuConnectStatus === "closed") {
        this.connectFailedSingle(id)
      }
    })
  }

  handleDanmaku(danmaku, clientIDs) {
    clientIDs.forEach(id => {
      if (this.clients[id]) {
        this.clients[id].send(CMD_DANMAKU, { data: danmaku })
      }
    })
  }

  handleSpeed(speed, clientIDs) {
    clientIDs.forEach(id => {
      if (this.clients[id]) {
        this.clients[id].send(CMD_SPEED, speed)
      }
    })
  }

  removeClient(clientID) {
    console.log("client Removed")
    this.clients[clientID] = null
    Reflect.deleteProperty(this.clients, clientID)
  }

  sendStats(id, stats) {
    if (this.clients[id]) {
      this.clients[id].send(CMD_STATS, stats)
    }
  }
}

module.exports = ClientsManager