const EventEmitter = require('events')
const DouyuHime = require('./DouyuHime')
const BiliBiliHime = require('./BiliBiliHime')
const { DanmakuHime_Events, Network_Events } = require('./constants')


class DanmakuHime extends EventEmitter {
  constructor() {
    super()
    this.client = null
  }

  connect(url, options) {
    const BiliBiliReg = /live.bilibili.com/
    const DouyuReg = /douyu.com/
    if (BiliBiliReg.test(url)) {
      this.client = new BiliBiliHime()
    } else if (DouyuReg.test(url)) {
      this.client = new DouyuHime()
    } else {
      this.emit(DanmakuHime_Events["connect:failed"], new Error("Invalid URL"))
    }
    this.client.on(Network_Events["connect:succeed"], () => {
      this.emit(DanmakuHime_Events["connect:succeed"])
    })
    this.client.on(Network_Events["msg"], () => {
      this.emit(DanmakuHime_Events["msg"])
    })
    this.client.connect(url, options)
  }

  close() {

    this.client.on(Network_Events["close"], () => {
      this.emit(DanmakuHime_Events["close"])
    })
    this.client.close()
  }
}

module.exports = DanmakuHime
