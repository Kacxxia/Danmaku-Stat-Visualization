import mediator, { CMDS } from '../Mediator/index.js'

class URLInput {
  constructor(settings) {
    const { URLInputter, URLInputterStatus } = settings
    this.inputterEle = URLInputter
    this.statusEle = URLInputterStatus

    this.url = ''
    this.inputterEle.addEventListener("input", (ev) => {
      if (ev.target.value) {
        this.url = ev.target.value
      }
    })
    this.inputterEle.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        URLInputterStatus.classList.remove("succeed")
        URLInputterStatus.classList.remove("failed")
        URLInputterStatus.classList.add("waiting")
        mediator.handle(CMDS.URL, this.url)
      }
    })
  }

  toggleStatus(status) {
    this.statusEle.classList.remove("waiting")
    if (status) this.statusEle.classList.add("succeed")
    if (!status) this.statusEle.classList.add("failed")
  }


}

export default URLInput