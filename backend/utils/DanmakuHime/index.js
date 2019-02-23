const DanmakuHime = require('./applicationLayer')
const { DanmakuHime_Events } = require('./constants')

const hime = new DanmakuHime()

hime.on(DanmakuHime_Events["msg"], console.log)
hime.connect(
  "https://www.douyu.com/88660",
  {
    loginOptions: {
      dfl: 
      [ { sn: '106', ss: '1' },
        { sn: '107', ss: '1' },
        { sn: '108', ss: '1' },
        { sn: '105', ss: '1' } ],
      username: '34950534',
      password: '1234567890123456',
      ver: '20180222',
      aver: '218101901',
      ct: '0' 
    }
  }
)
