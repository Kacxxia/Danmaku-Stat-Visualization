const NetworkLayer = require('./networkLayer')
const {
  Header_Fields,
  Network_Events,
  Session_Events,
  CONNECTION_TCP
} = require('./constants')

class DouyuHime extends NetworkLayer {
  constructor() {
    super({
      header: [
        Header_Fields["length"],
        Header_Fields["length"],
        Header_Fields["cmd"],
        Header_Fields["encrypt"],
        Header_Fields["reserve"]
      ],
      bytes: {
        [Header_Fields["length"]]: 4,
        [Header_Fields["length"]]: 4,
        [Header_Fields["cmd"]]: 2, 
        [Header_Fields["encrypt"]]: 1,
        [Header_Fields["reserve"]]: 1
      },
      defaults: {
        [Header_Fields["encrypt"]]: 0,
        [Header_Fields["reserve"]]: 0,
        [Header_Fields["cmd"]]: 689
      },
      isLittleEndiness: true,
      connection: {
        type: CONNECTION_TCP,
        host: "openbarrage.douyutv.com",
        port: "8601"
      }
    })
    this.BEAT_INTERVAL = 45000
    this.decorateSend()
    this._resolves = {}
    this.on(Network_Events["pkg"], (header, data) => this.handleSeg(header, data))
  }

  decorateSend() {
    const old = this.send.bind(this)
    this.send = (headers, data) => old(headers, this.formatData(data) + "/\0")
  }

  handleSeg(header, data) {
    // remove the ending /\0
    if (data[data.length - 1] === '\0') data = data.slice(0, data.length - 1)
    const dataObj = this.parseData(data)
    if (typeof dataObj === "object") {
      switch (dataObj.type) {
        case "loginres":
          this.handleLogin(dataObj)
          break;
        case "chatmsg":
          this.handleMsg(dataObj)
          break;
        default:
          console.error(`Unknown server msg: ${dataObj.type}`)
      }
    }
  }

  handleLogin() {
    this._resolves["login"].resolve()
  }

  handleMsg(msg) {
    this.emit(Session_Events["msg"], {
      user: msg.nn,
      msg: msg.txt
    })
  }

  async login(roomid, options) {
    return new Promise((resolve, reject) => {
      this._resolves["login"] = { resolve, reject }
      this.send({}, Object.assign({
        type: "loginreq",
        roomid: String(roomid),
      }, options.loginOptions || {}))
    })
  }

  async join(roomid) {
    this.send({}, {
      type: "joingroup",
      rid: String(roomid),
      gid: "-9999"
    })
  }

  async beat() {
    setInterval(() => {
      this.send({}, {
        type: "mrkl"
      })
    }, this.BEAT_INTERVAL);
  }

  async connect(url, options) {
    const roomIDReg = /(?:douyu\.com\/(\d+))/
    const roomID = url.match(roomIDReg)[1]
    if (roomID === undefined) throw new Error("Invalid Douyu URL")
    try {
      await this.createConnection()
      this.emit(Session_Events["connect:succeed"])
      await this.login(roomID, options)
      console.log(Session_Events["connect:succeed"])
      this.beat()
      this.join(roomID)
    } catch (err) {
      console.error(err)
      this.emit(Session_Events["connect:failed"], err)
    }
  }

  formatData(data) {
    function escape(str) {
      if (typeof str !== "string") {
        throw new Error("Data Must be String")
      }
      let result = ""
      for (let c of str) {
        switch (c) {
          case "@":
            result += "@A"
            break;
          case "/":
            result += "@S"
            break;
          default:
            result += c
        }
      }
      return result
    }
    if (typeof data === "string") return escape(data)

    if (Array.isArray(data)) return data.map((d) => escape(this.formatData(d))).join("/")

    return Object.keys(data)
            .map((key) => `${escape(key)}@=${escape(this.formatData(data[key]))}`)
            .join("/") 
  }

  parseData(data) {
    function unescape(str) {
      let result = ""
      for (let i=0; i < str.length; i++) {
        if (str)
        if (i+1 < str.length) {
          if (str[i] === "@" && str[i+1] === "A") {
            result += "@"
            i++
            continue;
          }
          if (str[i] === "@" && str[i+1] === "S") {
            result += "/"
            i++
            continue;
        }
        }
        result += str[i]
      }
      return result
    }
  
    if (data.includes("@=")) {
      let p = data.split("/")
      if (p[p.length - 1] === "") p.pop()
      return p.reduce((acc, entry) => {
        const e = unescape(entry).split("@=")
  
        acc[e[0]] = this.parseData(e[1])
        return acc
      }, {})
    }
  
    if (data.includes("/")) {
      let p = data.split("/")
      if (p[p.length - 1] === "") p.pop()
      return p.map(t => this.parseData(unescape(t)));
    }
      return data;
  }  
  
}

module.exports = DouyuHime