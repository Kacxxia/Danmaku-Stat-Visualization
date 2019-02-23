const NetworkLayer = require('./networkLayer')
const { Header_Fields, CONNECTION_WEBSOCKET, BILIBILI_DANMAKU_SERVER } = require('./constants')

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
        [Header_Fields["encrypt"]]: 0,
        [Header_Fields["reserve"]]: 0,
        [Header_Fields["cmd"]]: 689
      },
      isLittleEndiness: true,
      connection: {
        type: CONNECTION_WEBSOCKET,
        host: BILIBILI_DANMAKU_SERVER
      }
    })
  }
}

module.exports = BiliBiliHime