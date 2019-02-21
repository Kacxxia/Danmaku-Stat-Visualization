const NetworkLayer = require('./networkLayer')
const { Header_Fields } = require('./constants')

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
      // nth Field of header. Length isn't wrote in this layer.
      lengthFields: [0, 1],
      isLittleEndiness: true
    })
  }

  async login() {
    this.send({
      [Header_Fields["cmd"]]: ""
    })
  }

  async join() {
    const roomIDReg = /(?:douyu\.com\/(\d+))/

  }

  async ping() {

  }

  async connect(url, options) {
    const loginRes = await this.login(url, options)

    const joinRes = await this.join()

    setInterval(() => {
      this.ping()
    }, 40000);
  }

  formatData(data, isArrayData) {
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
      return result + "/\0"
    }

    if (isArrayData) return data.map(escape).join("/")

    return Object.keys(data)
            .map((key) => `${escape(key)}@=${escape(data[key])}`)
            .join("/")
  }

  parseData(data) {
    function unescape(str) {
      let result = ""
      for (let i=0; i < str.length; i++) {
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
    const eles = data.split("/")
    eles.pop() // remove the ending \0 
    if (!eles[0].includes("@=")) return eles.map(unescape)
    return eles.reduce((acc, entry) => {
            const e = entry.split("@=")
            acc[unescape(e[0])] = unescape(e[1])
            return acc
          }, {})
  }
}

module.exports = DouyuHime