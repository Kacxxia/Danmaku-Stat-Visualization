const { DanmakuHime, MSG_EVENT } = require('../DanmakuHime')
const DanmakuCounter = require('../DanmakuCounter')
const DBManager = require('../DBManager')

const database = new DBManager()

class Mediator {
  constructor() {
    this.clients = {}
  }

  handle(origin, cmd) {
    if (this.clients[origin] != undefined) {
      return this.clients[origin].handle(cmd)
    }
    return Promise.reject(new Error("Unknown Host"))
  }

  check(origin) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!database.initiated) {
          await database.init()
        }
        if (this.clients[origin] == undefined) {
          this.clients[origin] = new ClientManager()
        }
        resolve()
      } catch(err) {
        reject(err)
      }
      
    })
  }

  close(origin) {
    this.clients[origin] = null
  }
}

class ClientManager {
  constructor() {
    this.hime = new DanmakuHime()
    this.counter = new DanmakuCounter()
    this.hime.on(MSG_EVENT, (danmaku) => {
      this.counter.increaseDanmakuCount()
      this.counter.increaseKeywordCount(danmaku.msg)
    })
  }
  connect(url) {
    this.hime.connect(url, {
      loginOptions: {
        dfl: 
        [ { sn: '106', ss: '1' },
          { sn: '107', ss: '1' },
          { sn: '108', ss: '1' },
          { sn: '105', ss: '1' } ],
        username: '34950534',
        password: '1234567890123456',
        ver: '20180222',
        aver: '218101901',
        ct: '0' 
      }
    })
  }
  handle(cmd) {
    return new Promise((resolve, reject) => {
      switch (cmd) {

      }
    })
  }
}

module.exports = Mediator;

