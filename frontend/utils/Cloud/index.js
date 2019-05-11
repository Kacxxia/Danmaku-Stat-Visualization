import Clouding from '../../lib/cloud.js'
class Cloud {
  constructor(settings) {
    this.cloud = settings.cloud
    this.data = []
    this.width = this.cloud.clientWidth
    this.height = this.cloud.clientHeight
  }

  reset() {
    this.data = []
    d3.select(this.cloud).selectAll("*").remove()
  }

  paint(data) {
    const { cloud } = data
    this.data = cloud
    this.paintCloud()
  }

  paintCloud() {
    const data = this.data
    const countData = []
    const wordData = []
    console.log(this.data)
    data.forEach(d => {
      wordData.push(d.word)
      countData.push(d.count)
    })
    const sizeScale = d3.scaleLinear().domain([0, d3.max(countData)]).range([14, 54])
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(wordData)
    const words = data.reduce((acc, d) => {
      acc.push({
        text: d.word,
        size: sizeScale(d.count)
      })
      return acc
    }, [])
    this.layout = Clouding()
      .size([this.width, this.height])
      .words(words)
      .padding(0)
      .fontSize(function (d) { return d.size})
      .rotate(0)
      .on("end", (words) => this.draw(words))
    this.layout.start()
  }

  draw(words) {
    const colorScale = this.colorScale
    d3.select(this.cloud).append("svg")
      .attr("width", this.layout.size()[0])
      .attr("height", this.layout.size()[1])
    .append("g")
      .attr("transform", "translate(" + this.layout.size()[0] / 2 + "," + this.layout.size()[1] / 2 + ")")
    .selectAll("text")
      .data(words)
    .enter().append("text")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("font-family", "Roboto")
      .style("fill", function(d) { return colorScale(d.text)})
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; });
  }
}

export default Cloud