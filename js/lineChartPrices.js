
class LineChartPrices {
    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _filteredCarsData) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 750,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || { top: 25, right: 100, bottom: 30, left: 200 },
      };
      this.filteredCarsData = _filteredCarsData;
      this.initVis();
    }
  
    /**
     * Initialize scales/axes and append static chart elements
     */
    initVis() {
      let vis = this;
  
      vis.width =
        vis.config.containerWidth -
        vis.config.margin.left -
        vis.config.margin.right;
      vis.height =
        vis.config.containerHeight -
        vis.config.margin.top -
        vis.config.margin.bottom;
  
      vis.xScale = d3.scaleTime().range([0, vis.width]);
  
      vis.yScale = d3.scaleLinear().range([vis.height, 0]).nice();
  
      // Initialize axes
      vis.xAxis = d3
        .axisBottom(vis.xScale)
        .ticks(10)
        .tickSizeOuter(0)
        .tickPadding(10);
      //.tickFormat(d => d + ' km');
  
      vis.yAxis = d3
        .axisLeft(vis.yScale)
        .ticks(10)
        .tickSizeOuter(0)
        .tickPadding(10)
        .tickFormat(d => d + ' $');
  
      // Define size of SVG drawing area
      vis.svg = d3
        .select(vis.config.parentElement)
        .attr("width", vis.config.containerWidth)
        .attr("height", vis.config.containerHeight);
  
      // Append group element that will contain our actual chart (see margin convention)
      vis.chart = vis.svg
        .append("g")
        .attr(
          "transform",
          `translate(${vis.config.margin.left},${vis.config.margin.top})`
        );
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart
        .append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${vis.height})`);
  
      // Append y-axis group
      vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

      // Append axis title
      vis.svg.append('text')
          .attr('class', 'axis-title')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', '.71em')
          .text('Overall sales');
  
      // We need to make sure that the tracking area is on top of other chart elements
      vis.marks = vis.chart.append("g");
      vis.trackingArea = vis.chart
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("fill", "none")
        .attr("pointer-events", "all");
  
      //(event,d) => {
  
      // Empty tooltip group (hidden by default)
      vis.tooltip = vis.chart
        .append("g")
        .attr("class", "tooltip")
        .style("display", "none");
  
      vis.tooltip.append("circle").attr("r", 4);
  
      vis.tooltip.append("text");
    }
  
    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
      let vis = this;
  
      vis.xValue = (d) => d[0];
      vis.yValue = (d) => d[1];
  
      vis.line = d3
        .line()
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScale(vis.yValue(d)));
  
      // Set the scale input domains
      vis.xScale.domain(d3.extent(vis.filteredCarsData, vis.xValue));
      vis.yScale.domain(d3.extent(vis.filteredCarsData, vis.yValue));
  
      vis.bisectDate = d3.bisector(vis.xValue).left;
      console.log("bisectDate: ", vis.bisectDate);
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements
     */
    renderVis() {
      let vis = this;
      console.log(vis.filteredCarsData);
      // Add line path
      vis.marks
        .selectAll(".chart-line")
        .data([vis.filteredCarsData])
        .join("path")
        .attr("class", "chart-line")
        .attr("d", vis.line);
  
      vis.trackingArea
        .on("mouseenter", () => {
          vis.tooltip.style("display", "block");
        })
        .on("mouseleave", () => {
          vis.tooltip.style("display", "none");
        })
        .on("mousemove", function (event) {
          // Get date that corresponds to current mouse x-coordinate
          const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
          console.log("xpos: ", xPos);
          const date = vis.xScale.invert(xPos);
          console.log("date: ", JSON.stringify(date));
  
          // Find nearest data point
          const index = vis.bisectDate(vis.filteredCarsData, date, 1);
          console.log("index: ", index);
          const a = vis.filteredCarsData[index - 1];
          console.log("a: ", a);
          const b = vis.filteredCarsData[index];
          const d = b && date - a.date > b.date - date ? b : a;
          //debugger;
          // Update tooltip
          vis.tooltip
            .select("circle")
            .attr(
              "transform",
              `translate(${vis.xScale(d[0])},${vis.yScale(d[1])})`
            );
  
          vis.tooltip
            .select("text")
            .attr(
              "transform",
              `translate(${vis.xScale(d[0])},${vis.yScale(d[1]) - 15})`
            )
            .text(Math.round(d[1])+ ' $');
        });
  
      // Update the axes
      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.call(vis.yAxis);
    }
}