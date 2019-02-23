const DanmakuHime_Events = {
  "connect:failed": "DanmakuHime:connect:failed",
  "connect:succeed": "DanmakuHime:connect:succeed",
  "msg": "DanmakuHime:msg",
  "close": "DanmakuHime:connect:closed"
}

const Session_Events = {
  "connect:failed": "Session:connect:failed",
  "connect:succeed": "Session:connect:succeed",
  "msg": "Session:msg",
  "close": "Session:connect:closed"
}

const Network_Events = {
  "pkg": "Network:package:received",
  "connect:succeed": "Network:connect:succeed",
  "connect:failed": "Network:connect:failed"
}

const Header_Fields = {
  // Bilibili Protocol is unknown
  "unknown-1": "unknown-1",
  "unknown-2":"unknown-2",
  "unknown-3": "unknown-3",
  "unknown-4":"unknown-4",
  "length": "length",
  "cmd": "cmd",
  "encrypt": "encrypt",
  "reserve": "reserve"
}

const CONNECTION_TCP = "tcp"
const CONNECTION_WEBSOCKET = "websocket"

const BILIBILI_DANMAKU_SERVER = "wss://tx-bj4-live-comet-05.chat.bilibili.com/sub"
const BILIBILI_CMD = {
  "join": 7,
  "joinres": 8,
  "ping": 2,
  "pong": 3,
  "data": 5,
}


module.exports = {
  DanmakuHime_Events,
  Session_Events,
  Network_Events,
  Header_Fields,
  CONNECTION_TCP,
  CONNECTION_WEBSOCKET,
  BILIBILI_DANMAKU_SERVER,
  BILIBILI_CMD
}