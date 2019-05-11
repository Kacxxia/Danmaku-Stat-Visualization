class DanmakuCounter {
  constructor() {
    this.countMap = {}
  }

  reset(url) {
    this.countMap[url] = 0
  }
  increase(url) {
    this.countMap[url]++
  }

  collect(url) {
    const count = this.countMap[url]
    this.reset(url)
    return count;
  }
}

module.exports = DanmakuCounter;