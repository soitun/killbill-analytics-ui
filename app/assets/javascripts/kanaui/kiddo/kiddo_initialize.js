(function (d3, $, window, document, undefined) {
  function errorMessage(error) {
    if (error && error.responseText) {
      try {
        var response = JSON.parse(error.responseText);
        if (response.message) {
          return response.message;
        }
      } catch (ex) {
        return error.responseText;
      }
    }

    return error && error.message ? error.message : String(error);
  }

  function renderError(message) {
    var escapedMessage = $("<div/>").text(message).html();
    $("#chartAnchor").prepend(
      '<div class="alert alert-danger" role="alert">' + escapedMessage + "</div>"
    );
  }

  $(document).ready(function () {
    if ($("#chartAnchor").length == 0) {
      return;
    }

    d3.json($("#chartAnchor").data("reports-path")).then(function (json) {
      $("#loading-spinner").remove();

      var renderer = new Kiddo.Renderer("#chartAnchor");

      var data = json[0];

      if (
        data === undefined ||
        data.data === undefined ||
        data.data.length == 0
      ) {
        return renderer.noData();
      }

      var render = function (type) {
        switch (type) {
          case "COUNTERS":
            renderer.pieChart(data);
            break;
          case "TIMELINE":
            renderer.lineChart(data);
            // Date controls only make sense for timelines
            $("#date-controls").show();
            break;
          case "TABLE":
            renderer.table(data);
            break;
          default:
            console.log("No such type implemented: " + type);
            renderer.noData();
        }
      };

      try {
        render(data.type);
      } catch (ex) {
        console.log(ex);
        renderer.noData();
      }
    }).catch(function (error) {
      $("#loading-spinner").remove();

      var renderer = new Kiddo.Renderer("#chartAnchor");
      renderError(errorMessage(error));
      return renderer.noData();
    });
  });
})(d3, jQuery, window, document);
