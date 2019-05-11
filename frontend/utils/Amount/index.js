class Amount {
  constructor(settings) {
    this.amountChart = settings.amountChart
    this.amountData = []
  }

  paint(data) {
    const { amount } = data
    this.amountData = amount
    this.amountData.shift()
    this.paintAmount()
  }

  reset() {
    this.amountData = []
    d3.select(this.amountChart).selectAll("*").remove()
  }

  paintAmount() {
    const data = this.amountData
    console.log(data)
    const timeData = []
    const countData = []
    data.forEach((d) => {
      const time = new Date(d.time)
      const hour = time.getHours()
      timeData.push(`${hour}`)
      countData.push(d.count)
    })

    const width = this.amountChart.clientWidth
    const height = this.amountChart.clientHeight
    const margin = { left: 40, right: 20, top: 20, bottom: 20 }
    const x = d3.scaleBand().domain(timeData).rangeRound([0, width - margin.left - margin.right])
    const y = d3.scaleLinear().domain([0, d3.max(countData)]).rangeRound([height - margin.top - margin.bottom, 0])

    const svg = d3.select(this.amountChart)
      .append("svg")
      .attr("width", width)
      .attr("height", height)


    const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    g.append("g")
      .attr("class", "axis x")
      .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
      .call(d3.axisBottom(x));
    g.append("g")
      .attr("class", "axis y")
      .call(d3.axisLeft(y));

    const rectGap = 4
    g.selectAll(".dataRect")
      .data(data)
      .enter()
      .append("rect")
      .style("fill", "lightgray")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")")
      .attr("x", function(d) { return x(new Date(d.time).getHours() + '') + rectGap / 2 - margin.left})
      .attr("y", function (d) { return height - margin.top - (height - y(d.count))})
      .attr("width", x.bandwidth() - rectGap)
      .attr("height", function (d) { return height - y(d.count) - margin.top - margin.bottom})
  }

}

export default Amount