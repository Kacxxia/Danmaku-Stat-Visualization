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
    this.client = new Client(settings.connection, this.pkgHandler.bind(this))
    this.client.connect()
    this.headerSize = this.header.reduce((acc, field) => acc + this.bytes[field], 0)
    // Idiot Douyu. The length field occured twice but its value only counts one length field
    this.headerLength = Object.values(this.bytes).reduce((acc, length) => acc + length, 0)
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

  pkgHandler(data) {
    if (!Buffer.isBuffer(data)) {
      console.error(typeof data)
      throw new Error("Error in parsing data")
    }
    let buf = Buffer.from(data)

    const results = []
    while(buf.length > 0) {
      const pkgLength = this.readBuf(buf, this.bytes[Header_Fields["length"]], this.header.indexOf(Header_Fields["length"])) + this.headerSize - this.headerLength
      results.push([
        buf.slice(0, this.headerSize),
        buf.slice(this.headerSize, pkgLength - this.headerSize).toString()
      ])
      buf = buf.slice(pkgLength, buf.length)
    }
    results.forEach(([header, data]) => this.emit(Network_Events["pkg"], header, data))
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
    this.clien.close()
  }
}

class Client {
  constructor(conn, pkgHandler) {
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

  connect() {
    this.client.connect()
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
    this.url = url
    this.msgHandler = msgHandler
    this.client = new WS()
  }
  
  connect() {
    this.client.on("connect", (connection) => {
      this.connection = connection
      connection.on('message', this.msgHandler)
    })
    this.client.connect(this.url)
  }

  close() {
    this.connection.close()
  }

  send(data) {
    this.connection.sendBytes(data)
  }
}

class TCPClient {
  constructor(conn, msgHandler) {
    this.conn = conn
    this.msgHandler = msgHandler
    this.client = new TCP.Socket()
    this.connCallbacks = []
    this.client.on("data", this.msgHandler)
    this.client.on("error", (err) => console.log(err))
    this.client.on("close", () => console.log("closed"))
    this.client.on("connect", () => {
      console.log("connected")
      if (this.connCallbacks) {
        this.connCallbacks.forEach(cb => cb())
        this.connCallbacks.length = 0
      }
    })
  }
  
  connect() {
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

module.exports = NetworkLayer