const DBManager = require('./index')

console.log(DBManager)


const dic = "abcdefghijklmnopqrstuvwxyz".split("")

const db = new DBManager()
db.init().then(async () => {
  setInterval(async  () => {
    const word = dic[Math.floor(Math.random() * dic.length)]
    const platform = ["douyu", "BiliBili"][Math.floor(Math.random() * 2)]
    db.updateFrequency(platform, "6666", word, Math.floor(Math.random() * 10))
    const result = await db.getWordsFrequency("douyu", "6666")
    console.log(result)
  }, 2000);
})