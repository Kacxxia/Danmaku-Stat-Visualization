const EventEmitter = require('events')
const DouyuHime = require('./DouyuHime')
const BiliBiliHime = require('./BiliBiliHime')
const { DanmakuHime_Events, Session_Events } = require('./constants')

const STATUS_CLOSED = "closed"
const STATUS_CONNECTED = "connected"

class DanmakuHime extends EventEmitter {
  constructor() {
    super()
    this.client = null
  }

  connect(url, options) {
    const BiliBiliReg = /live\.bilibili\.com\/\d+/
    const DouyuReg = /douyu\.com\/\d+/

    if (this.status === STATUS_CONNECTED) {
      this.close()
    }

    if (BiliBiliReg.test(url)) {
      this.client = new BiliBiliHime()
    } else if (DouyuReg.test(url)) {
      this.client = new DouyuHime()
    } else {
      this.emit(DanmakuHime_Events["connect:failed"], new Error("Invalid URL"))
    }
    
    this.client.on(Session_Events["connect:succeed"], () => {
      this.emit(DanmakuHime_Events["connect:succeed"])
      this.status = STATUS_CONNECTED
    })
    this.client.on(Session_Events["connect:failed"], (err) => {
      this.emit(DanmakuHime_Events["connect:failed"], err)
    })
    this.client.on(Session_Events["msg"], (msg) => {
      this.emit(DanmakuHime_Events["msg"], msg)
    })
    this.client.connect(url, options)
  }

  close() {
    if (this.client) {
      this.client.close()
    }
    this.status = STATUS_CLOSED
  }
}

module.exports = DanmakuHime
