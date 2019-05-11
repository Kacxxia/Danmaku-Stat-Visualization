import URLInput from '../URLInput/index.js'
import Speed from '../Speed/index.js'
import Amount from '../Amount/index.js'
import Chat from '../Chat/index.js'
import Cloud from '../Cloud/index.js'

export const CMDS = {
  MSG: "msg",
  URL: "url",
  CONNECT_SUCCEED: "connect_succeed",
  CONNECT_FAILED: "connect_failed",
  CHAT: "chat",
  SPEED: "speed",
  STATS: "stats"
}

class Mediator {
  init(settings) {
    this.dog = "dog"
    this.socket = settings.socket
    this.initSocket(settings.socket)
    this.inputter = new URLInput(settings.URLInputter)
    this.speedChart = new Speed(settings.speedChart)
    this.amountChart = new Amount(settings.amountChart)
    this.chatRoom = new Chat(settings.chatRoom)
    this.tagCloud = new Cloud(settings.cloud)
  }

  initSocket(socket) {
    socket.addEventListener('open', () => {
      console.log('opened')
    })
    
    socket.addEventListener('message', (ev) => this.msgHandler(ev))
  }

  msgHandler(ev) {
    const obj = JSON.parse(ev.data)
    switch (obj.type) {
      case "connect":
        if (obj.payload && obj.payload.code === 200) {
          this.handle(CMDS.CONNECT_SUCCEED)
        } else {
          this.handle(CMDS.CONNECT_FAILED)
        }
        break;
      case "danmaku":
        this.handle(CMDS.CHAT, obj.payload.data)
        break;
      case "speed":
        this.handle(CMDS.SPEED, obj.payload)
        break;
      case "stats":
        this.handle(CMDS.STATS, obj.payload)
        break;
      default:
        // console.log("unknown msg", obj)
    }
  }

  socketSend(type, payload) {
    this.socket.send(JSON.stringify({
      end: "client",
      type,
      payload
    }))
  }

  handle(cmd, ...args) {
    switch (cmd) {
      case CMDS.URL:
        this.chatRoom.reset()
        this.speedChart.reset()
        this.amountChart.reset()
        this.socketSend("connect", ...args)
        break;
      case CMDS.CONNECT_SUCCEED:
        this.inputter.toggleStatus(true)
        break;
      case CMDS.CONNECT_FAILED:
        this.inputter.toggleStatus(false)
        break;
      case CMDS.CHAT:
        this.chatRoom.addBullet(...args)
        break;
      case CMDS.SPEED:
        this.speedChart.addSpeed(...args)
        break;
      case CMDS.STATS:
        this.amountChart.paint(...args)
        this.tagCloud.paint(...args)
        break;
      default:
        console.log("Unknown")
    }
  }
}

export default new Mediator()