import mediator from '../Mediator/index.js'


class Speed {
  constructor(settings) {
    this.data = []
    this.batched = []
    this.seed = []
    this.speedChart = settings.speedChart
    
    this.chart = this.charting()
    const now = +new Date()
    for (let i=0; i < 29; i++) {
      this.seed.push({
        time: new Date(now - 1000 * (29 - i)),
        value: 0
      })
    }
    this.data = this.seed.slice()
    d3.select(this.speedChart).datum(this.data).call(this.chart)
    setInterval(() => this.flushSpeed(), 1000)
  }

  reset() {
    this.data = this.seed.slice()
    this.batched = []
    d3.select(this.speedChart).selectAll("*").remove()
    d3.select(this.speedChart).datum(this.data).call(this.chart)
  }

  addSpeed(speed) {
    this.batched.push({
      time: new Date(),
      value: +speed
    })
  }

  flushSpeed() {
    if (this.batched.length) {
      this.data.push(this.batched.shift())
      if (this.data.length > 30) this.data.shift()
      d3.select(this.speedChart).datum(this.data).call(this.chart)
    }
  }

  charting() {
    const margin = {top: 20, right: 20, bottom: 20, left: 30},
        width = this.speedChart.clientWidth,
        height = this.speedChart.clientHeight,
        duration = 1000
  
    function chart(selection) {
      selection.each(function(data) {
        const t = d3.transition().duration(duration).ease(d3.easeLinear),
            x = d3.scaleTime().rangeRound([0, width-margin.left-margin.right]),
            y = d3.scaleLinear().rangeRound([height-margin.top-margin.bottom, 0])
  
        const xMin = d3.min(data, function(d) { return d.time });
        const xMax = d3.max(data, function(d) { return d.time });
        const yMin = d3.min(data, function(d) { return d.value });
        const yMax = d3.max(data, function(d) { return d.value });
  
        x.domain([xMin, xMax]);
        y.domain([yMin, yMax]);
  
        let svg = d3.select(this).selectAll("svg").data([data]);
        const gEnter = svg.enter().append("svg").append("g");
        gEnter.append("g").attr("class", "axis x");
        gEnter.append("g").attr("class", "axis y");
        gEnter.append("defs").append("clipPath")
            .attr("id", "clip")
          .append("rect")
            .attr("width", width-margin.left-margin.right - 40)
            .attr("height", height-margin.top-margin.bottom);
        gEnter.append("g")
            .attr("class", "lines")
            .attr("clip-path", "url(#clip)")
          .selectAll(".data").data([data]).enter()
            .append("path")
              .attr("class", "data");
  
  
        svg = selection.select("svg");
        svg.attr('width', width).attr('height', height);
        const g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
        g.select("g.axis.x")
          .attr("transform", "translate(0," + (height-margin.bottom-margin.top) + ")")
          .transition(t)
          .call(d3.axisBottom(x));
        g.select("g.axis.y")
          .transition(t)
          .attr("class", "axis y")
          .call(d3.axisLeft(y));
  
        g.selectAll("g path.data")
          .data(data)
          .transition()
          .style("stroke", "blue")
          .style("stroke-width", 1)
          .style("fill", "none")
          .duration(duration)
          .ease(d3.easeLinear)
          .on("start", tick);
  
        const line = d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d.time); })
          .y(function(d) { return y(d.value); });
  
        function tick() {
          d3.select(this)
            .attr("d", function(d) { return line(data); })
            .attr("transform", null);
  
          const xMinLess = new Date(new Date(xMin).getTime() - duration);
          d3.active(this)
              .attr("transform", "translate(" + x(xMinLess)+ ",0)")
            .transition()
              .on("start", tick);
        }
      });
    }
  
    return chart;
  }

}

export default Speed