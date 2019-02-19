const NetworkLayer = require('./networkLayer')
const { Header_Fields } = require('./constants')

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
      isLittleEndiness: false
    })
  }
}

module.exports = BiliBiliHime