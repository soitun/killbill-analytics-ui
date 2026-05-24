(function (Kiddo, d3) {
  Kiddo.Helper = function () {
    var formatValue = function (d) {
      return d % 1 === 0 ? d3.format(",d")(d) : d3.format(",.2f")(d);
    };
    var formatCurrency = function (d) {
      return "$" + formatValue(d);
    };

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

    var formatSeriesName = function (name, reportName) {
      return String(name || "")
        .split(/\s*::\s*/)
        .filter(function (segment) {
          // Remove numeric-only segments (tenant record id)
          return !/^\d+$/.test(segment.trim());
        })
        .map(function (segment) {
          var parts = segment.split(/\s*:\s*/);
          if (parts.length > 1) {
            var label = (reportName && parts[0].trim().toLowerCase() === "count")
              ? reportName
              : humanizeSegment(parts[0]);
            return label + " (" + humanizeSegment(parts.slice(1).join(": ")) + ")";
          }
          return humanizeSegment(segment);
        })
        .filter(function (segment) {
          return segment.length > 0;
        })
        .join(" : ");
    };

    // Extracts just the qualifier part (e.g. "EUR" from "count: EUR :: 1") for compact tooltip labels
    var formatSeriesLabel = function (name) {
      var segments = String(name || "")
        .split(/\s*::\s*/)
        .filter(function (segment) {
          return !/^\d+$/.test(segment.trim());
        });

      if (segments.length === 0) return humanizeSegment(name);

      var parts = segments[0].split(/\s*:\s*/);
      if (parts.length > 1) {
        return humanizeSegment(parts.slice(1).join(": "));
      }
      return humanizeSegment(segments[0]);
    };

    var parseDateFn = d3.timeParse("%Y-%m-%d");
    var formatDateFn = d3.timeFormat("%b %d, %Y");
    var formatDate = function (dateStr) {
      var parsed = parseDateFn(dateStr);
      return parsed ? formatDateFn(parsed) : dateStr;
    };

    return {
      parseDate: parseDateFn,
      bisectDate: d3.bisector(function (d) {
        return d.x;
      }).left,
      formatCurrency: formatCurrency,
      formatValue: formatValue,
      formatSeriesName: formatSeriesName,
      formatDate: formatDate,
      formatValueDisplay: function (name, d) {
        return formatSeriesLabel(name) + ": " + formatValue(d.y);
      },
    };
  };
})((window.Kiddo = window.Kiddo || {}), d3);
