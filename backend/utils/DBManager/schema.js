const mongoose = require('mongoose')

const schema = {
  platform: String,
  room: String,
  word: String,
  count: Number
}

const counterSchema = new mongoose.Schema(schema)
const Frequency = mongoose.model("Frequency", counterSchema)

module.exports = Frequency