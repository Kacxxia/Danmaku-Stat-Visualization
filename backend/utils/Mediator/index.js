
let instance

const CMDS = {
  "CONNECT": "CONNECT",
  "CONNECT_FAILED": "FAILED",
  "CONNECT_SUCCEED": "CONNECT_SUCCEED",
  "CLOSE": "CLOSE",
  "NEW_CLIENT": "NEW_CLIENT",
  "REMOVE_CLIENT": "REMOVE_CLIENT",
  "CONNECT_DANMAKU_SERVER": "CONNECT_DANMAKU_SERVER",
  "SUBSCRIBE": "SUBSCRIBE",
  "DANMAKU": "DANMAKU",
  "SPEED": "SPEED",
  "COLLECT": "COLLECT",
  "QUERY_STATS": "QUERY_STATS",
  "SEND_STATS": "SEND_STATS",
  "SWITCH_STATUS_CONNECTED": "SWITCH_STATUS_CONNECTED"
}

class Mediator {
  constructor() {
    this.clientsManager = null
    this.danmakuManager = null
  }

  init() {
    return new Promise(async (resolve, reject) => {
      this.clientsManager = new ClientsManager()
      this.danmakuManager = new DanmakuManager()
      try {
        await this.danmakuManager.initDB()
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  handle(cmd, ...args) {
    switch (cmd) {
      case CMDS["NEW_CLIENT"]:
        this.clientsManager.createClient(...args)
        break;
      case CMDS["REMOVE_CLIENT"]:
        this.danmakuManager.removeSubscriber(...args)
        break;
      case CMDS["CONNECT_SUCCEED"]:
        this.clientsManager.connectSucceed(...args)
        break;
      case CMDS["CONNECT_FAILED"]:
        this.clientsManager.connectFailed(...args)
        break;
      case CMDS["CONNECT_DANMAKU_SERVER"]:
        this.danmakuManager.addClient(...args)
        break;
      case CMDS["SUBSCRIBE"]:
        this.danmakuManager.addSubscriber(...args)
        break;
      case CMDS["DANMAKU"]:
        this.clientsManager.handleDanmaku(...args)
        break;
      case CMDS["SPEED"]:
        this.clientsManager.handleSpeed(...args)
        break;
      case CMDS["COLLECT"]:
        this.danmakuManager.handleCollect(...args)
        break;
      case CMDS["QUERY_STATS"]:
        this.danmakuManager.handleStats(...args)
        break;
      case CMDS["SEND_STATS"]:
        this.clientsManager.sendStats(...args)
        break;
      case CMDS["SWITCH_STATUS_CONNECTED"]:
        this.clientsManager.connectSucceedSingle(...args)
        break;
      default:
        console.warn("Mediator: Unknown cmd", cmd)
    }
  }

  close(origin) {
    this.clients[origin] = null
  }
}

function Singleton() {
  if (instance == null) instance = new Mediator();
  return instance
}

module.exports = { Mediator: Singleton, MEDIATOR_CMDS: CMDS }

const ClientsManager = require('./ClientsManager')
const DanmakuManager = require('./DanmakuManager')







