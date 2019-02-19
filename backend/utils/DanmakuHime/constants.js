const DanmakuHime_Events = {
  "connect:failed": "DanmakuHime:connect:failed",
  "connect:succeed": "DanmakuHime:connect:succeed",
  "msg": "DanmakuHime:msg",
  "close": "DanmakuHime:connect:closed"
}

const Network_Events = {
  "connect:failed": "connect:failed",
  "connect:succeed": "connect:succeed",
  "msg": "msg",
  "close": "connect:closed"
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

module.exports = {
  DanmakuHime_Events,
  Network_Events,
  Header_Fields
}