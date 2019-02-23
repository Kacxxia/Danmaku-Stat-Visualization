const { JSDOM, VirtualConsole } = require('jsdom')
const NetworkLayer = require('./networkLayer')
const { 
  Header_Fields,
  CONNECTION_WEBSOCKET,
  BILIBILI_DANMAKU_SERVER,
  Network_Events,
  Session_Events,
  BILIBILI_CMD
} = require('./constants')

const quietConsole = new VirtualConsole()

class BiliBiliHime extends NetworkLayer {
  constructor() {
    super({
      header: [
        Header_Fields["unknown-1"],
        Header_Fields["length"],
        Header_Fields["unknown-2"],
        Header_Fields["unknown-3"],
        Header_Fields["cmd"],
        Header_Fields["unknown-4"]
      ],
      bytes: {
        [Header_Fields["unknown-1"]]: 2,
        [Header_Fields["length"]]: 2,
        [Header_Fields["unknown-2"]]: 2, 
        [Header_Fields["unknown-3"]]: 2,
        [Header_Fields["cmd"]]: 4,
        [Header_Fields["unknown-4"]]: 4
      },
      defaults: {
        [Header_Fields["unknown-1"]]: 0,
        [Header_Fields["unknown-2"]]: 16,
        [Header_Fields["unknown-3"]]: 1,
        [Header_Fields["unknown-4"]]: 1
      },
      isLittleEndiness: false,
      connection: {
        type: CONNECTION_WEBSOCKET,
        host: BILIBILI_DANMAKU_SERVER
      }
    })
    this.BEAT_INTERVAL = 30000
    this.decorateSend()
    this._resolves = {}
    this.on(Network_Events["pkg"], (header, data) => this.handleSeg(header, data))
  }

  decorateSend() {
    const old = this.send.bind(this)
    this.send = (headers, data) => old(headers, this.formatData(data))
  }

  readCMDField(header) {
    const buf = Buffer.from(header)
    return buf.readUInt32BE(8)
  }

  handleSeg(header, data) {
    if (this.readCMDField(header) === BILIBILI_CMD["data"]) {
      const dataObj = this.parseData(data)
      if (typeof dataObj === "object") {
        switch (dataObj["cmd"]) {
          case "DANMU_MSG":
            this.handleMsg(dataObj)
            break;
          default:
            console.error(`Unhandled server data msg type: ${dataObj["cmd"]}`)
        }
      }
    }
  }

  handleMsg(msg) {
    this.emit(Session_Events["msg"], {
      user: msg.info[2][1],
      msg: msg.info[1]
    })
  }

  join(roomid) {
    this.send(
      {
        [Header_Fields["cmd"]]: 7
      }, 
      {
        uid: 2281746,
        protover: 1,
        platform: "web",
        clientver: "1.5.15",
        roomid
      }
    )
  }

  async beat() {
    setInterval(() => {
      this.send(
        {
          [Header_Fields["cmd"]]: 2
        },
        "[object Object]"
      )
    }, this.BEAT_INTERVAL);
  }

  async getRoomID(url) {
    return new Promise((resolve, reject) => {
        JSDOM.fromURL(url, {
          runScripts: "dangerously",
          resources: "usable",
          virtualConsole: quietConsole
        }).then(dom => {
          let counter = 0
          const p = setInterval(() => {
            let bilibili = dom.window.BilibiliLive
            counter++
            if (bilibili && bilibili.ROOMID !== 0) {
              clearInterval(p)
              dom.window.close()
              resolve(bilibili.ROOMID)
              return;
            }
            if (counter * 500 >= 1000 * 14) {
              clearInterval(p)
              dom.window.close()
              reject(new Error("解析URL失败，请检查网络或URL"))
            }
          }, 500)
      })
    })
  }

  async connect(url) {
    try {
      await this.createConnection()
      const roomID = await this.getRoomID(url)
      this.join(roomID)
      console.log(Session_Events["connect:succeed"])
      this.emit(Session_Events["connect:succeed"])
      this.beat()
    } catch (err) {
      console.error(err)
      this.emit(Session_Events["connect:failed"], err)
    }
  }

  formatData(data) {
    return JSON.stringify(data)
  }

  parseData(data) {
    return JSON.parse(data)
  }  
}

module.exports = BiliBiliHime