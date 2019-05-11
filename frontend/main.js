import mediator from './utils/Mediator/index.js'
const socket = new WebSocket("ws://localhost:8080")
const root = document.getElementById("root")

const URLInputter = document.getElementById("URLInputter")
const URLInputterStatus = document.getElementById("URLInputterStatus")
const chatRoom = document.getElementById("ChatRoom")
const speedChart = document.getElementById("SpeedChart")
const amountChart = document.getElementById("AmountChart")
const cloud = document.getElementById("Cloud")

const settings = {
  URLInputter: {
    URLInputter,
    URLInputterStatus
  },
  chatRoom: {
    chatRoom
  },
  speedChart: {
    speedChart
  },
  amountChart: {
    amountChart
  },
  cloud: {
    cloud
  },
  socket
}
mediator.init(settings)
