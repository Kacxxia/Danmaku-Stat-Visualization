const EventEmitter = require('events')
const Jieba = require('nodejieba2')

const DBManager = require('../../DBManager')
const { DanmakuHime, HIME_EVENTS } = require('../../DanmakuHime')
const { CLIENT_DANMAKU_RECEIVED, CLIENT_CONNECT_FAILED, CLIENT_CONNECT_SUCCEED } = require('./constants')
const UsefulSingleWords = require('./customDict')

Jieba.load({
  userDict: __dirname + "./dict.txt"
})

class Client extends EventEmitter{
  constructor() {
    super()
    this.hime = new DanmakuHime()
    this.db = new DBManager()
    this.url = undefined
    this.platform = undefined
    this.room = undefined

    this.danmakuHandler = this.danmakuHandler.bind(this)
    this.connect = this.connect.bind(this)
    this.close = this.close.bind(this)
  }

  danmakuHandler(danmaku) {
    this.emit(CLIENT_DANMAKU_RECEIVED, danmaku)
    this.db.save(
      Object.assign({}, danmaku, {
        platform: this.platform,
        room: this.room
      })
    )
    const words = Jieba.cut(danmaku.msg, true)
    words.forEach(word => this.db.updateFrequency(this.platform, this.room, word, 1))
  }

  connect(url) {
    this.url = url

    const roomReg = /\.com\/(\d+)/
    if (url.includes("douyu")) {
      this.platform = "douyu"
    } else if (url.includes("bilibili")) {
      this.platform = "bilibili"
    }
    try {
      this.room = roomReg.exec(url)[1]
    } catch (err) {
      this.emit(CLIENT_CONNECT_FAILED)
      return;
    }

    this.hime.on(HIME_EVENTS.MSG, this.danmakuHandler)
    this.hime.on(HIME_EVENTS.CONNECT_SUCCEED, () => this.emit(CLIENT_CONNECT_SUCCEED))
    this.hime.on(HIME_EVENTS.CONNECT_FAILED, () => this.emit(CLIENT_CONNECT_FAILED))
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

  async queryStats() {
    try {
      const now = new Date()
      const bf = new Date(now.getTime() - 1000 * 60 * 60 * 24)
      let counts = await this.db.countDanmakuByTimeInterval(
        this.platform,
        this.room,
        bf.toISOString(),
        now.toISOString()
      )
      const topFrequency = await this.db.getFrequencyTop(this.platform, this.room)

      const countResult = []
      counts.forEach(c => {
        countResult.push({
          time: c.time.toNanoISOString(),
          count: +c.count_msg
        })
      })
      if (countResult.length === 0) {
        let bftime = bf.getTime()
        for (let i=0; i<12; i++) {
          countResult.push({
            time: new Date(bftime + i * 2 * 60 * 60 * 1000).toISOString(),
            count: 0
          })
        }
      }
      const topResult = []
      topFrequency.forEach(f => {
        if (f.word.length <= 1 && !UsefulSingleWords.includes(f.word)) return;
        topResult.push({
          word: f.word,
          count: f.count
        })
      })
      return ({
        amount: countResult,
        cloud: topResult
      })
    } catch (err) {
      console.error(err)
    }
  }

  close() {
    this.hime.close()
  }
}

module.exports = Client