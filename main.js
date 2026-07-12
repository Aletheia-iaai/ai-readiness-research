(function () {
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Ranked priority selection: click order assigns №1–№3, max three,
  // deselecting renumbers the rest. Ranks are submitted via hidden fields.
  var grid = document.getElementById('f-priorities');
  if (grid) {
    var hidden = [
      document.getElementById('rank1'),
      document.getElementById('rank2'),
      document.getElementById('rank3'),
    ];
    var boxes = Array.prototype.slice.call(grid.querySelectorAll('input[type="checkbox"]'));
    var order = [];

    boxes.forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (cb.checked) {
          if (order.length >= 3) {
            cb.checked = false;
            return;
          }
          order.push(cb);
        } else {
          order = order.filter(function (x) { return x !== cb; });
        }
        boxes.forEach(function (b) { b.removeAttribute('data-rank'); });
        order.forEach(function (b, i) { b.setAttribute('data-rank', String(i + 1)); });
        hidden.forEach(function (h, i) { h.value = order[i] ? order[i].value : ''; });
      });
    });
  }
})();
