(function (Kiddo, d3) {
  Kiddo.Helper = function () {
    var formatCurrency = function (d) {
      return "$" + formatValue(d);
    };
    var formatValue = d3.format(",.2f");

    var humanizeSegment = function (segment) {
      segment = String(segment || "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!segment) {
        return "";
      }

      return segment
        .split(" ")
        .map(function (word) {
          if (/^\d+(\.\d+)?$/.test(word)) {
            return word;
          }
          if (/^[A-Z]{2,3}$/.test(word)) {
            return word;
          }

          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
    };

    var formatSeriesName = function (name) {
      return String(name || "")
        .split(/\s*::\s*/)
        .map(function (segment) {
          var parts = segment.split(/\s*:\s*/);
          if (parts.length > 1) {
            return humanizeSegment(parts[0]) + " (" + humanizeSegment(parts.slice(1).join(": ")) + ")";
          }

          return humanizeSegment(segment);
        })
        .filter(function (segment) {
          return segment.length > 0;
        })
        .join(" / ");
    };

    return {
      parseDate: d3.time.format("%Y-%m-%d").parse,
      bisectDate: d3.bisector(function (d) {
        return d.x;
      }).left,
      formatCurrency: formatCurrency,
      formatValue: formatValue,
      formatSeriesName: formatSeriesName,
      formatValueDisplay: function (name, d) {
        return formatSeriesName(name) + ": " + formatValue(d.y); // Add currency boolean on backend later -- formatCurrency(d.y); }
      },
    };
  };
})((window.Kiddo = window.Kiddo || {}), d3);
