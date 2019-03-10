const Influx = require('influx')

class DBManager {
  constructor() {
    this.influx = this.buildDB()
    this.initiated = false
    this.save = this.save.bind(this)
  }

  init() {
    return new Promise(async (resolve, reject) => {
      try {
        const names = await this.influx.getDatabaseNames()
        if (!names.includes('danmaku-vis')) {
          await this.influx.createDatabase('danmaku-vis')
        }
        this.initiated = true
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

module.exports = DBManager