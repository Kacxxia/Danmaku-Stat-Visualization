const DanmakuHime = require('./applicationLayer')
const { DanmakuHime_Events } = require('./constants')

const hime = new DanmakuHime()

hime.on(DanmakuHime_Events["msg"], console.log)
hime.connect(
  "https://live.bilibili.com/6",
)
