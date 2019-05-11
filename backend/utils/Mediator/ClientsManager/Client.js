class Client {
  constructor(id, connection) {
    this.id = id
    this.connection = connection
    this.url = undefined
    this.danmakuConnectStatus = "closed"

    this.switchStatusToConnected = this.switchStatusToConnected.bind(this)
    this.switchStatusToFailed = this.switchStatusToFailed.bind(this)
  }

  send(type, payload) {
    this.connection.sendUTF(JSON.stringify({
      end: "server",
      type,
      payload
    }))
  }

  switchStatusToConnected() {
    this.danmakuConnectStatus = "connected"
  }

  switchStatusToFailed() {
    this.danmakuConnectStatus = "failed"
  }

  switchStatusToClosed() {
    this.danmakuConnectStatus = "closed"
  }

}

module.exports = Client