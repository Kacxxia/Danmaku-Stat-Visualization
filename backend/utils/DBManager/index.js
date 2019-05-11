const Influx = require('influx')
const Mongoose = require('mongoose')
const Frequency = require('./schema')

let instance
class DBManager {
  constructor() {
    this.influx = this.buildDB()
    this.initiated = false
    this.save = this.save.bind(this)

    this.dic = {}
    this.dicWritter = null

    this.init = this.init.bind(this)
  }

  init() {
    return new Promise(async (resolve, reject) => {
      try {
        await Mongoose.connect('mongodb://localhost:27017/danmaku-vis', { useNewUrlParser: true })
        const names = await this.influx.getDatabaseNames()
        if (!names.includes('danmaku-vis')) {
          await this.influx.createDatabase('danmaku-vis')
        }
        this.initiated = true
        this.dicWritter = setInterval(this.saveUpdate.bind(this), 5000)
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  save(data, measurement = "Danmaku") {
    const { msg, sender, platform, room } = data
    return this.influx.writePoints([
      {
        measurement,
        tags: {
          platform,
          room
        },
        fields: {
          msg,
          sender
        }
      }
    ])
  }

  countDanmakuByTimeInterval(platform, room, startTime, endTime, interval = "2h") {
    return this.influx.query(`
      SELECT COUNT(*) FROM Danmaku
      WHERE platform = '${platform}'
      AND room = '${room}'
      AND time > '${startTime}'
      AND time <= '${endTime}'
      GROUP BY time(${interval})
    `)
  }

  getFrequencyTop(platform, room) {
    return Frequency.find({ platform, room }).limit(180).sort({ count: -1 }).exec()
  }

  async saveUpdate() {
    console.log("collecting....")
    console.log(this.dic)
    const roomKeys = Object.keys(this.dic)
    if (roomKeys.length === 0) return;
    const updateWrites = []
    const platforms = []
    const rooms = []

    roomKeys.forEach((roomKey) => {
      const [platform, room] = roomKey.split("@=")
      platforms.push(platform)
      rooms.push(room)

      const words = Object.keys(this.dic[roomKey])

      words.forEach(word => {
        updateWrites.push({
          updateOne: {
            filter: { platform, room, word },
            update: { 
              $setOnInsert: { platform, room, word, count: 0 },
            },
            upsert: true
          }
        })

        updateWrites.push({
          updateOne: {
            filter: { platform, room, word },
            update: { 
              $inc: { count: this.dic[roomKey][word] }
            },
          }
        })
      })

    })

    try {
      await Frequency.collection.bulkWrite(
        updateWrites,
        { ordered: true }
      )
    } catch (err) {
      throw err
    } finally {
      this.dic = {}
    }
  }

  updateFrequency(platform, room, word, count) {
    const roomKey = platform + "@=" + room
    if (this.dic[roomKey] == undefined) this.dic[roomKey] = {}
    if (this.dic[roomKey][word] == undefined) this.dic[roomKey][word] = 0
    this.dic[roomKey][word] += count
  }

  async getWordsFrequency(platform, room) {
    const results = await Frequency.find({ platform, room })

    return results.reduce((acc, result) => {
      acc.words[result.word] = result.count
      return acc
    }, { platform, room, words: {} })
  }

  buildDB() {
    return new Influx.InfluxDB({
      host: 'localhost',
      database: 'danmaku-vis',
      schema: [
        {
          measurement: 'Danmaku',
          fields: {
            msg: Influx.FieldType.STRING,
            sender: Influx.FieldType.STRING
          },
          tags: [
            'platform',
            'room',
          ]
        },
      ]
    })
  }
}


function Singleton() {
  if (!instance) instance = new DBManager();
  return instance
}

module.exports = Singleton