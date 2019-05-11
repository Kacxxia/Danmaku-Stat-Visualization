import mediator from '../Mediator/index.js'

class Chat {
  constructor(settings) {
    this.chatRoom = settings.chatRoom
    this.flag = true
  }

  addBullet(data) {
    if (this.flag) {
      const el = document.createElement("div")
      el.className = "bullet"
      const user = document.createElement("span")
      user.className = "user"
      user.textContent = data.user
      const msg = document.createElement("span")
      msg.className = "msg"
      msg.textContent = data.msg
      el.appendChild(user)
      el.appendChild(msg)
      this.chatRoom.appendChild(el)
      this.chatRoom.scrollTop = this.chatRoom.scrollHeight
    }
  }

  reset() {
    this.flag = false
    while(this.chatRoom.firstChild) {
      this.chatRoom.removeChild(this.chatRoom.firstChild)
    }
    this.flag = true
  }

}

export default Chat