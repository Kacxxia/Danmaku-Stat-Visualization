
const EventEmitter = require('events')

const { Mediator, MEDIATOR_CMDS } = require('../index')
const DanmakuCounter = require('../../DanmakuCounter')
const DBManager = require('../../DBManager')
const Client = require('./Client')
const {  CLIENT_DANMAKU_RECEIVED, CLIENT_CONNECT_FAILED, CLIENT_CONNECT_SUCCEED } = require('./constants')

const mediator = new Mediator()

class DanmakuManager extends EventEmitter{
  constructor() {
    super()
    this.clients = {}
    this.subscribers = {} // {url: subscribers}
    this.subscriberUrl = {} // { clientid: url }
    this.needToCollect = {}
    this.db = new DBManager()
    this.counter = new DanmakuCounter()

    this.removeClientDelayers = {}
    this.counterTimers = {}

    this.connect = this.connect.bind(this)
    this.close = this.close.bind(this)
    this.addClient = this.addClient.bind(this)
    this.removeClient = this.removeClient.bind(this)
    this.addSubscriber = this.addSubscriber.bind(this)
    this.removeSubscriber = this.removeSubscriber.bind(this)
  }

  async initDB() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.db.init()
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  connect(url, clientID) {
    this.addClient(url)
    this.addSubscriber(url, clientID)
  }

  close(url, clientID) {
    this.removeSubscriber(url, clientID)
  }

  addClient(url) {
    if (this.removeClientDelayers[url]) {
      clearTimeout(this.removeClientDelayers[url])
    }
    if (this.clients[url] == undefined) {
      this.clients[url] = new Client()
      this.clients[url].on(CLIENT_CONNECT_FAILED, () => mediator.handle(MEDIATOR_CMDS["CONNECT_FAILED"],this.subscribers[url]))
      this.clients[url].on(CLIENT_CONNECT_SUCCEED, () => mediator.handle(MEDIATOR_CMDS["CONNECT_SUCCEED"],this.subscribers[url]))
      this.clients[url].on(CLIENT_DANMAKU_RECEIVED, (danmaku) => {
        this.counter.increase(url)
        mediator.handle(MEDIATOR_CMDS["DANMAKU"], danmaku, this.subscribers[url])
      })
      this.counter.reset(url)
      this.counterTimers[url] = setInterval(() => {
        mediator.handle(MEDIATOR_CMDS["SPEED"], this.counter.collect(url), this.subscribers[url])
      }, 1000)
      
      this.clients[url].connect(url)
    }
  }

  removeClient(url) {
    this.removeClientDelayers[url] = setTimeout(() => {
      clearInterval(this.counterTimers[url])
      this.clients[url].close()
      this.clients[url] = null
      this.removeClientDelayers[url] = null
    }, 5000)
  }

  addSubscriber(url, clientID) {
    let isConnected = false
    if (this.subscriberUrl[clientID] === url) return true;
    if (this.subscriberUrl[clientID] !== undefined) this.removeSubscriber(url, clientID);

    if (this.subscribers[url] == undefined) {
      this.subscribers[url] = []
    } else {
      isConnected = true
    }
    this.subscribers[url].push(clientID)
    this.subscriberUrl[clientID] = url
    if (isConnected) {
      mediator.handle(MEDIATOR_CMDS.SWITCH_STATUS_CONNECTED, clientID)
    }
  }

  removeSubscriber(url, clientID) {
    if (this.subscribers[url]) {
      const index = this.subscribers[url].findIndex((id => id === clientID))
      if (index >= 0) {
        this.subscribers[url].splice(index, 1);
        Reflect.deleteProperty(this.subscriberUrl, clientID)
      }
      if (this.subscribers[url].length === 0 && this.needToCollect[url] === undefined) {
        this.removeClient(url);
      }
    }
  }

  handleCollect(url) {
    this.needToCollect[url] = true
  }

  async handleStats(clientID) {
    try {
      const url = this.subscriberUrl[clientID]
      const stats  = await this.clients[url].queryStats()
      mediator.handle(MEDIATOR_CMDS["SEND_STATS"], clientID, stats)
    } catch (err) {
      console.error(err)
    }

  }
}

module.exports = DanmakuManager