fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((response) => response.json())
  .then((res) => {
    createHeatMap(res);
  });

let createHeatMap = (data) => {
  const width = 1300;
  const height = 580;
  const padding = 70;

  let baseTemp = data.baseTemperature;

  monthlyVarianceSet = data.monthlyVariance.map((item) => {
    return { ...item, temp: baseTemp + item.variance };
  });

  let tempScale = d3
    .scaleLinear()
    .domain([
      d3.min(monthlyVarianceSet, (mV) => mV.temp),
      d3.max(monthlyVarianceSet, (mV) => mV.temp),
    ])
    .range([0, 10]);

  const colorRange = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#f7f7f7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061",
  ];

  let months = [
    "January",
    "Feburary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let tooltip = d3.select(".visHolder").append("div").attr("id", "tooltip");

  const xScale = d3
    .scaleTime()
    .domain([
      d3.min(monthlyVarianceSet, (mV) => mV["year"]),
      d3.max(monthlyVarianceSet, (mV) => mV["year"]),
    ])
    .range([padding, width - padding]);

  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range([padding, height - padding]);

  let svgContainer = d3
    .select(".visHolder")
    .append("svg")
    .attr("id", "svgContainer")
    .attr("height", height)
    .attr("width", width);

  let xDomain = xScale.domain();
  let timeFormatforYear = d3.format("d");
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(Math.min(20, xDomain[1] - xDomain[0]))
    .tickFormat(timeFormatforYear);

  const yAxis = d3.axisLeft(yScale).tickFormat((month) => {
    let date = new Date(0);
    date.setUTCMonth(month);
    return d3.timeFormat("%B")(date);
  });

  svgContainer
    .append("g")
    .attr("id", "x-axis")
    .call(xAxis)
    .attr("transform", `translate(0, ${height - padding})`);

  svgContainer
    .append("g")
    .attr("id", "y-axis")
    .call(yAxis)
    .attr("transform", "translate(" + padding + ",0)");

  svgContainer
    .selectAll("rect")
    .data(monthlyVarianceSet)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .style("fill", (d) => {
      return colorRange[Math.floor(tempScale(d.temp))];
    })
    .attr("x", (d) => xScale(d.year + 0.3))
    .attr("y", (d) => yScale(d.month - 1))
    .attr(
      "width",
      Math.floor(width / Math.floor(monthlyVarianceSet.length / 12))
    )
    .attr("height", yScale.bandwidth(yScale.domain()))
    .attr("data-month", (d) => {
      return d["month"] - 1;
    })
    .attr("data-year", (d) => {
      return d["year"];
    })
    .attr("data-temp", (d) => {
      return d["temp"];
    })
    .on("mouseover", (d, i) => {
      tooltip
        .transition()
        .style("opacity", 0.8)
        .style("left", d3.event.pageX - 75 + "px")
        .style("top", d3.event.pageY - 95 + "px");
      tooltip
        .html(
          "<p>" +
            d.year +
            "-" +
            months[d.month - 1] +
            "</p>" +
            "<p>" +
            d.temp.toFixed(1) +
            "&#176;C" +
            "</p>" +
            "<p>" +
            d.variance.toFixed(2) +
            "&#176;C" +
            "</p>"
        )
        .attr("data-year", d["year"]);
    })
    .on("mouseout", () => {
      tooltip.transition().style("opacity", 0);
    });

  svgContainer
    .append("svg")
    .attr("id", "legend")
    .attr("width", 1000)
    .attr("height", 40)
    .attr("x", width / 2 - 495)
    .attr("y", "535")
    .selectAll("rect")
    .data(colorRange)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * (1000 / 11))
    .attr("y", 0)
    .attr("width", 1000 / 11)
    .attr("height", 40)
    .attr("fill", (c) => c);

  svgContainer
    .append("text")
    .attr("id", "description")
    .attr("x", 10)
    .attr("y", 40)
    .text("Monthly Global Land-Surface Temperature");

  svgContainer
    .append("text")
    .attr("id", "description")
    .attr("x", width - 375)
    .attr("y", 40)
    .text("1753 - 2015: base temperature 8.66℃");
};
