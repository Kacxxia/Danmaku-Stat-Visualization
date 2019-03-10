const DanmakuHime = require('./applicationLayer')
const { DanmakuHime_Events } = require('./constants')

module.exports = {
  HIME_EVENTS: {
    MSG: DanmakuHime_Events["msg"],
    CONNECT_SUCCEED: DanmakuHime_Events["connect:succeed"],
    CONNECT_FAILED: DanmakuHime_Events["connect:failed"]
  },
  DanmakuHime
}

