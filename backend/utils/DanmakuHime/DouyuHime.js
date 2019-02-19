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
      isLittleEndiness: true
    })
  }
}

module.exports = DouyuHime