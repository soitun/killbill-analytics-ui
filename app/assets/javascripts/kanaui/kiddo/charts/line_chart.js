(function (Kiddo, d3) {
  Kiddo.LineChart = function () {
    var self = this;

    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    var valueline = d3
      .line()
      .x(function (d) {
        return self.x(d.x);
      })
      .y(function (d) {
        return self.y(d.y);
      })
      .curve(d3.curveMonotoneX);

    var axes = Kiddo.Axes.apply(this);
    var helper = new Kiddo.Helper();

    // Custom multi-color theme matching the image
    var colors = [
      "#2196F3", // blue
      "#E53935", // red
      "#43A047", // green
      "#FB8C00", // orange
      "#8E24AA", // purple
      "#00ACC1", // cyan
      "#F4511E", // deep orange
      "#6D4C41", // brown
    ];
    self.color = d3.scaleOrdinal().range(colors);

    return {
      render: function (svg, json) {
        var title = json.title,
          datasets = json.data;

        datasets.forEach(function (dataset) {
          dataset.values.forEach(function (d) {
            d.date = d.x.split("T")[0];
            d.x = helper.parseDate(d.date);
            d.y = +d.y;
          });
        });

        // Scale the range of the data before rendering axes
        var allValues = datasets.reduce(function (result, element) {
          return result.concat(element.values);
        }, []);

        var x_domain = d3.extent(allValues, function (d) {
          return d.x;
        });

        self.x.domain(x_domain);

        var y_domain = d3.extent(allValues, function (d) {
          return d.y;
        });

        self.y.domain(y_domain);

        // Render axes first
        axes.render(svg, title);

        self.color.domain(datasets.map(function (dataset) {
          return dataset.name;
        }));

        // Create legend container at the top
        var legendContainer = svg
          .append("g")
          .attr("class", "chart-legend")
          .attr("transform", "translate(" + (self.width - 100) + ", -25)");

        // Calculate total values for legend
        var legendData = datasets.map(function (dataset, index) {
          var latestValue = dataset.values[dataset.values.length - 1];
          var totalCount = dataset.values.length;
          return {
            name: dataset.name,
            value: latestValue ? latestValue.y : 0,
            count: totalCount,
            color: self.color(dataset.name),
            index: index,
          };
        });

        // Create legend items
        var legendItems = legendContainer
          .selectAll(".legend-item")
          .data(legendData)
          .enter()
          .append("g")
          .attr("class", "legend-item");

        var xOffset = 0;
        legendItems.each(function (d, i) {
          var legendItem = d3.select(this);

          // Add colored circle
          legendItem
            .append("circle")
            .attr("cx", xOffset + 6)
            .attr("cy", 0)
            .attr("r", 6)
            .style("fill", d.color);

          // Add text label
          var labelText =
            helper.formatSeriesName(d.name) + " (" + d.count + "): " + d3.format(",.2f")(d.value);
          legendItem
            .append("text")
            .attr("x", xOffset + 18)
            .attr("y", 0)
            .attr("dy", "0.35em")
            .style("font-size", "0.875rem")
            .style("font-weight", "500")
            .style("fill", "#6B7280")
            .text(labelText);

          // Calculate width for next item
          var textWidth = this.getBBox().width;
          xOffset += textWidth + 40; // Add spacing between items
        });

        // Render data lines
        datasets.forEach(function (dataset) {
          var data = dataset.values,
            name = dataset.name;

          svg
            .append("path")
            .attr("class", "line")
            .attr("d", valueline(data))
            .attr("transform", "translate(" + self.margin_left + ",0)")
            .style("stroke", function () {
              return self.color(name);
            })
            .style("stroke-width", "0.125rem")
            .style("fill", "none")
            .style("opacity", 0.9);
        });

        self.datasets = datasets;
        Kiddo.Utils.MouseOver.apply(self).render(svg, self.x, self.y);
      },
    };
  };
})((window.Kiddo = window.Kiddo || {}), d3);
