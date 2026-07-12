(function () {
  var PRIORITY_ORDER = [
    "Continuous control monitoring / testing",
    "SOX walkthroughs & evidence gathering",
    "Investigation & fraud triage",
    "Thematic / board & audit committee reporting",
    "Data quality & source-of-truth reconciliation",
    "Risk assessment & audit planning",
    "Upskilling the team",
    "Other",
  ];

  var CONFIDENCE_ORDER = [
    "Low — we haven’t really started",
    "Developing — piloting, unsure of governance",
    "Confident — in production, refining controls",
    "Very confident — embedded and defensible",
  ];

  var REGION_ORDER = ["APAC", "EMEA", "Americas", "Global", "Other"];

  function show(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "";
  }
  function hide(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
  }

  function renderBars(containerId, order, counts, total) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    var max = 0;
    order.forEach(function (key) {
      var n = counts[key] || 0;
      if (n > max) max = n;
    });

    var sorted = order.slice().sort(function (a, b) {
      return (counts[b] || 0) - (counts[a] || 0);
    });

    sorted.forEach(function (key) {
      var n = counts[key] || 0;
      var pct = max > 0 ? Math.round((n / max) * 100) : 0;

      var row = document.createElement("div");
      row.className = "bar-row reveal is-visible";

      var head = document.createElement("div");
      head.className = "bar-row-head";

      var label = document.createElement("div");
      label.className = "bar-row-label";
      label.textContent = key;

      var count = document.createElement("div");
      count.className = "bar-row-count";
      count.textContent = n + (total ? " / " + total : "");

      head.appendChild(label);
      head.appendChild(count);

      var track = document.createElement("div");
      track.className = "bar-track";
      var fill = document.createElement("div");
      fill.className = "bar-fill";
      track.appendChild(fill);

      row.appendChild(head);
      row.appendChild(track);
      container.appendChild(row);

      // set width after insertion so the CSS transition animates
      window.requestAnimationFrame(function () {
        fill.style.width = pct + "%";
      });
    });
  }

  fetch("/.netlify/functions/results-data", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      hide("state-loading");
      hide("state-error");
      hide("state-empty");

      if (data.error) throw new Error(data.error);

      if (!data.total) {
        show("state-empty");
        return;
      }

      document.getElementById("total-count").textContent = data.total;
      show("results-total-wrap");

      show("live-priorities");
      renderBars("priorities-bars", PRIORITY_ORDER, data.priorities || {}, data.total);

      show("live-confidence");
      renderBars("confidence-bars", CONFIDENCE_ORDER, data.confidence || {}, data.total);

      show("live-region");
      renderBars("region-bars", REGION_ORDER, data.region || {}, data.total);
    })
    .catch(function () {
      hide("state-loading");
      show("state-error");
    });
})();
