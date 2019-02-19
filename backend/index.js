const Influx = require('influx')
const express = require('express')

const app = express()

app.use((req, res, next) => {
  res.on("finish", () => {
    influx.writePoints([
      {
        measurement: "Danmaku",
        tags: {
          platform: "BiliBili",
          room: 14,
        },
        fields: {
          author: "Admin",
          msg: `visit on ${Date()}`
        }
      }
    ]).catch(err => {
      console.err(err)
    })
  })
  return next()
})

app.get('/', (req, res) => {
  res.end('Hello, World!')
})

app.get('/stat', async (req, res) => {
  try {
    const result = await influx.query(`
      select * from Danmaku
      limit 10
    `)
    res.json(result)
  } catch (err) {
    console.err(err)
  }
})

const influx = new Influx.InfluxDB({
  host: 'localhost',
  database: 'danmaku-vis',
  schema: [
    {
      measurement: 'Danmaku',
      fields: {
        msg: Influx.FieldType.STRING,
        author: Influx.FieldType.STRING
      },
      tags: [
        'platform',
        'room',
      ]
    }
  ]
})

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('danmaku-vis')) {
      return influx.createDatabase('danmaku-vis')
    }
  })
  .then(() => {
    app.listen(8080, () => console.log("Server is listening on http://localhost:8080"))
  })
  .catch(err => {
    console.err(err)
  })

