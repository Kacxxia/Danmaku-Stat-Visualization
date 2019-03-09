class DanmakuCounter {
  constructor(options) {
    const { 
      keywordCollectInterval = 1000,
      danmakuCollectInterval = 1000,
    } = options
    this.danmakuCount = 0
    this.keywordMap = {}
    this.keywordCollectInterval = keywordCollectInterval
    this.danmakuCollectInterval = danmakuCollectInterval
  }

  increaseDanmakuCount() {
    this.danmakuCount++
  }

  increaseKeywordCount(msg) {
    Object.keys(this.keywordMap).forEach(key => {
      if (msg.includes(key)) {
        this.keywordMap[key]++
      }
    })
  }

  collectDanmaku() {
    const count = this.danmakuCount
    this.danmakuCount = 0
    return count;
  }

  collectKeyword() {
    const result = Object.assign({}, this.keywordMap)
    Object.keys(this.keywordMap).forEach(key => this.keywordMap[key] = 0)
    return result;
  }

  addKeyword(keyword) {
    if (this.keywordMap[keyword] === undefined) {
      this.keywordMap[keyword] = 0
    }
  }

  removeKeyword(keyword) {
    if (this.keywordMap[keyword] !== undefined) {
      Reflect.deleteProperty(this.keywordMap, keyword)
    }
  }
}

module.exports = DanmakuCounter;