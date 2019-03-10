const { DanmakuHime, HIME_EVENTS } = require('../DanmakuHime')
const DanmakuCounter = require('../DanmakuCounter')
const DBManager = require('../DBManager')

const database = new DBManager()

const CMD = {
  "COLLECT_ALL": "COLLECT",
  "COLLECT_KEYWORD": "COLLECT_KEYWORD",
  "CONNECT": "CONNECT",
  "CLOSE": "CLOSE"
}

class Mediator {
  constructor() {
    this.clients = {}
  }

  handle(origin, cmd, ...args) {
    if (this.clients[origin] != undefined) {
      return this.clients[origin].handle(cmd, ...args)
    }
    return Promise.reject(new Error("Unknown Host"))
  }

  check(origin, danmakuHandler) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!database.initiated) {
          await database.init()
        }
        if (this.clients[origin] == undefined) {
          this.clients[origin] = new ClientManager(danmakuHandler)
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
  constructor(danmakuHandler) {
    this.hime = new DanmakuHime()
    this.counter = new DanmakuCounter()
    this.danmakuHandler = danmakuHandler
    this.hime.on(HIME_EVENTS.MSG, (danmaku) => {
      this.counter.increaseDanmakuCount()
      this.counter.increaseKeywordCount(danmaku.msg)
      database.save(
        Object.assign({}, danmaku, {
          platform: this.platform,
          room: this.room
        })
      )
      this.danmakuHandler(danmaku)
    })
    this.handle = this.handle.bind(this)
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      const roomReg = /\.com\/(\d+)/
      if (url.includes("douyu")) {
        this.platform = "douyu"
      } else if (url.includes("bilibili")) {
        this.platform = "bilibili"
      }
      this.room = roomReg.exec(url)[1]
  
      this.hime.on(HIME_EVENTS["CONNECT_SUCCEED"], () => resolve())
      this.hime.on(HIME_EVENTS["CONNECT_FAILED"], (err) => reject(err))
  
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
    })
  }

  handle(cmd, ...args) {
    return new Promise((resolve, reject) => {
      switch (cmd) {
        case CMD["COLLECT_ALL"]: 
          resolve(this.counter.collectDanmaku())
          break;
        case CMD["COLLECT_KEYWORD"]:
          resolve(this.counter.collectKeyword())
          break;
        case CMD["CONNECT"]:
          this.connect(...args).then(resolve).catch(reject)
          break;
        case CMD["CLOSE"]:
          this.hime.close()
          break;
      }
    })
  }
}

module.exports = {
  Mediator,
  MEDIATOR_CMDS: CMD
};

