const EventEmitter = require("events")
const TCP = require('net')
const WS = require('websocket').client
const { Network_Events, CONNECTION_TCP, CONNECTION_WEBSOCKET, Header_Fields } = require("./constants")

class NetworkLayer extends EventEmitter {
  constructor(settings) {
    super()
    this.header = settings.header
    this.bytes = settings.bytes
    this.defaults = settings.defaults
    this.isLittleEndiness = settings.isLittleEndiness
    this.headerSize = this.header.reduce((acc, field) => acc + this.bytes[field], 0)
    // The length field occured twice but Douyu only takes one length field into account when set it.
    this.headerLength = Object.values(this.bytes).reduce((acc, length) => acc + length, 0)

    this.pkgHandler = new PackageHandler(
      settings,
      (header, data) => this.emit(Network_Events["pkg"], header, data)
    )
    this.client = new Client(settings.connection, this.pkgHandler.handle)
  }

  createConnection(url) {
    return new Promise((resolve, reject) => {
      this.client.on(Network_Events["connect:succeed"], resolve)
      this.client.on(Network_Events["connect:failed"], (err) => reject(err))
      this.client.connect(url)
    })
  }
  
  writeBuf(buf, length, value, offset) {
    switch (length) {
      case 1:
        buf.writeUInt8(value, offset)
        break;
      case 2:
        if (this.isLittleEndiness) {
          buf.writeUInt16LE(value, offset)
        } else {
          buf.writeUInt16BE(value, offset)
        }
        break;
      case 4:
        if (this.isLittleEndiness) {
          buf.writeUInt32LE(value, offset)
        } else {
          buf.writeUInt32BE(value, offset)
        }
        break;
      default:
        throw new Error("Invalid writeBuf usage")
    }
  }

  send(headers, data) {
    const headBuffer = Buffer.alloc(this.headerSize)
    const dataSize = Buffer.byteLength(data)
    this.header.reduce((offset, field) => {
      let value
      if (headers[field] !== undefined) value = headers[field]
      if (headers[field] === undefined) value = this.defaults[field]
      if (field === Header_Fields["length"]) value = this.headerLength + dataSize

      this.writeBuf(headBuffer, this.bytes[field], value, offset)
      offset += this.bytes[field]
      return offset
    }, 0)
    this.client.send(Buffer.concat([headBuffer, Buffer.from(data)]))
  }

  close() {
    this.client.close()
  }
}

class Client extends EventEmitter {
  constructor(conn, pkgHandler) {
    super()
    switch (conn.type) {
      case CONNECTION_TCP:
        this.client = new TCPClient(conn, pkgHandler)
        break;
      case CONNECTION_WEBSOCKET:
        this.client = new WebsocketClient(conn.host, pkgHandler)
        break;
      default:
        throw new Error(`Unsupported connection type: ${conn.type}`)
    }
  }

  connect(url) {
    this.client.connect(url, (status, ...args) => {
      if (status === "succeed") {
        this.emit(Network_Events["connect:succeed"], ...args)
      }
      if (status === "failed") {
        this.emit(Network_Events["connect:failed"], ...args)
      }
    })
  }

  close() {
    this.client.close()
  }

  send(data) {
    this.client.send(data)
  }
}

class WebsocketClient {
  constructor(url, msgHandler) {
    this.defaultUrl = url
    this.msgHandler = msgHandler
  }
  
  connect(url, callback) {
    this.client = new WS()
    this.client.on("connect", (connection) => {
      this.connection = connection
      connection.on('message', (data) => {
        this.msgHandler(data)
      })
      callback("succeed")
    })
    this.client.on("connectFailed", (err) => {
      callback("failed", err)
    })
    this.client.connect(url || this.defaultUrl)
  }

  close() {
    this.connection.close()
  }

  send(data) {
    this.connection.sendBytes(data)
  }
}

class TCPClient extends EventEmitter {
  constructor(conn, msgHandler) {
    super()
    this.conn = conn
    this.msgHandler = msgHandler
  }
  
  connect(url, callback) {
    this.client = new TCP.Socket()
    this.connCallbacks = []
    this.client.on("data", this.msgHandler)
    this.client.on("error", (err) => console.log(err))
    this.client.on("connect", () => {
      callback("succeed")
    })
    this.client.connect({
      port: this.conn.port,
      host: this.conn.host
    })
  }

  close() {
    this.client.end()
  }

  send(data) {
    if (this.client.connecting) {
      this.connCallbacks.push(() => {
        this.client.write(data)
      })
      return;
    }
    this.client.write(data)
  }
}

class PackageHandler {
  constructor(settings, cb) {
    this.header = settings.header
    this.isLittleEndiness = settings.isLittleEndiness
    this.bytes = settings.bytes
    this.headerSize = this.header.reduce((acc, field) => acc + this.bytes[field], 0)
    // The length field occured twice but Douyu only takes one length field into account when set it.
    this.headerLength = Object.values(this.bytes).reduce((acc, length) => acc + length, 0)
    this.lengthOffset = 0
    for (let i=0; i<this.header.length; i++) {
      if (this.header[i] === Header_Fields["length"]) break;
      this.lengthOffset += this.bytes[this.header[i]]
    }

    this.cb = cb
    this.pkgTotalLength = 0
    this.pkgHeader = Buffer.alloc(0)
    this.pkgData = Buffer.alloc(0)
    this.handle = this.handle.bind(this)
  }

  reset() {
    this.pkgTotalLength = 0
    this.pkgHeader = Buffer.alloc(0)
    this.pkgData = Buffer.alloc(0)
  }

  readBuf(buf, length, offset) {
    switch (length) {
      case 1:
        return buf.readUInt8(offset)
      case 2:
        if (this.isLittleEndiness) {
          return buf.readUInt16LE(offset)
        } else {
          return buf.readUInt16BE(offset)
        }
      case 4:
        if (this.isLittleEndiness) {
          return buf.readUInt32LE(offset)
        } else {
          return buf.readUInt32BE(offset)
        }
      default:
        throw new Error("Invalid readBuf usage")
    }
  }

  handle(data) {
    let buf
    if (!Buffer.isBuffer(data)) {
      if (data.binaryData !== undefined) {
        buf = data.binaryData
      } else {
        throw new Error("Error in parsing data")
      }
    } else {
      buf = Buffer.from(data)
    }

    while(buf.length > 0) {
      try {
        const collectedLength = this.pkgHeader.length + this.pkgData.length
        if (collectedLength < this.pkgTotalLength) {
          this.pkgData = Buffer.concat([this.pkgData, buf.slice(0, this.pkgTotalLength - collectedLength)])
          buf = buf.slice(this.pkgTotalLength - collectedLength, buf.length)
        } else {
          this.pkgHeader = Buffer.concat([this.pkgHeader, buf.slice(0, this.headerSize - this.pkgHeader.length)])
          if (this.pkgHeader.length < this.headerSize) continue;
          const pkgLength = this.readBuf(buf, this.bytes[Header_Fields["length"]], this.lengthOffset) + this.headerSize - this.headerLength
          this.pkgTotalLength = pkgLength
          this.pkgData = Buffer.concat([this.pkgData, buf.slice(this.headerSize, pkgLength)])
          buf = buf.slice(pkgLength, buf.length)
        }
        if ((this.pkgHeader.length + this.pkgData.length) === this.pkgTotalLength) {
          this.cb(this.pkgHeader, this.pkgData.toString())
          this.reset()
        }
      } catch (err) {
        console.log(err)
        this.reset()
      }
     
    }
  }
}

module.exports = NetworkLayer