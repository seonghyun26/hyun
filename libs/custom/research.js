(function () {
  'use strict';

  // The page is artwork and figure links; dragging either out of it does
  // nothing useful, and -webkit-user-drag is not honoured everywhere.
  document.addEventListener('dragstart', function (event) { event.preventDefault(); });

  document.querySelectorAll('.paper-image img').forEach(function (image) {
    function fitFigure() {
      if (image.naturalWidth && image.naturalHeight) {
        image.closest('.research-card').style.setProperty('--figure-ratio', image.naturalWidth / image.naturalHeight);
      }
    }
    image.addEventListener('load', fitFigure, { once: true });
    fitFigure();
  });

  // Figure widths set the spacing. Titles can be wider without introducing
  // empty space around a narrow figure; keep them inside the visible rail.
  var singleFieldView = window.matchMedia('(max-width: 1000px)');
  document.querySelectorAll('.research-cards').forEach(function (rail) {
    var activeCard = null;
    // A regular mouse wheel moves figures horizontally. The page itself never
    // scrolls vertically - html and body are overflow:hidden at every width -
    // so a vertical wheel over a rail has nothing else to do, and this is the
    // only way a wheel-only mouse reaches the figures past the first screenful.
    // Trackpad horizontal gestures already scroll the rail natively and are
    // left alone, as is ctrl+wheel, which the browser reads as zoom.
    rail.addEventListener('wheel', function (event) {
      if (event.ctrlKey ||
          rail.scrollWidth <= rail.clientWidth || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      var unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1;
      event.preventDefault();
      rail.scrollLeft += event.deltaY * unit;
    }, { passive: false });
    function positionTitle(card) {
      var bounds = rail.getBoundingClientRect();
      var figure = card.querySelector('.paper-image').getBoundingClientRect();
      var cardBounds = card.getBoundingClientRect();
      // 320 rather than 280: at 280 the longest titles take a third line, and
      // every figure has to reserve room for that line whether it uses it or
      // not. Wider wraps them to two and the rails get shorter for it.
      var width = Math.min(320, bounds.width - 16);
      var centered = (figure.left + figure.right - width) / 2;
      var left = Math.max(bounds.left, Math.min(centered, bounds.right - width));
      card.style.setProperty('--caption-width', width + 'px');
      card.style.setProperty('--caption-left', (left - cardBounds.left) + 'px');
    }
    rail.querySelectorAll('.research-card').forEach(function (card) {
      function showTitle() { activeCard = card; positionTitle(card); }
      card.addEventListener('mouseenter', showTitle);
      card.addEventListener('focusin', showTitle);
    });
    function updateTitle() {
      if (activeCard && rail.clientWidth) positionTitle(activeCard);
    }
    rail.addEventListener('scroll', updateTitle, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(updateTitle).observe(rail);
  });

  var motionToggle = document.querySelector('.motion-toggle');
  if (motionToggle) motionToggle.addEventListener('click', function () {
    var paused = document.documentElement.classList.toggle('motion-paused');
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion');
    if (paused) settleFields();
  });

  var sections = Array.from(document.querySelectorAll('.research-group'));
  var fieldButtons = document.querySelectorAll('[data-field]');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var selectedIndex = sections.findIndex(function (section) { return section.classList.contains('is-current'); });
  var fieldFrame = 0, previousFieldTime = 0;
  var fieldMotion = sections.map(function (section, index) {
    return {section: section, rail: section.querySelector('.research-cards'),
      position: Math.sign(index - selectedIndex), velocity: 0, target: Math.sign(index - selectedIndex)};
  });

  function settleFields() {
    cancelAnimationFrame(fieldFrame);
    fieldFrame = previousFieldTime = 0;
    fieldMotion.forEach(function (state, index) {
      state.position = state.target = Math.sign(index - selectedIndex);
      state.velocity = 0;
      state.section.classList.remove('is-transitioning');
      state.section.inert = singleFieldView.matches && index !== selectedIndex;
      state.section.setAttribute('aria-hidden', String(state.section.inert));
      state.rail.style.removeProperty('transform');
      state.rail.style.removeProperty('opacity');
      state.rail.style.removeProperty('will-change');
    });
  }

  function paintFields() {
    var distance = Math.min(360, Math.max(160, sections[selectedIndex].clientHeight * .55));
    fieldMotion.forEach(function (state) {
      state.rail.style.transform = 'translateY(' + state.position * distance + 'px)';
      state.rail.style.opacity = String(Math.max(0, 1 - Math.abs(state.position)));
    });
  }

  function animateFields(timestamp) {
    var dt = previousFieldTime ? Math.min((timestamp - previousFieldTime) / 1000, .064) : 0;
    previousFieldTime = timestamp;
    var moving = false;
    fieldMotion.forEach(function (state) {
      // Exact critically damped spring: retargeting preserves both the visible
      // position and velocity, even when a second tab is clicked mid-flight.
      var offset = state.position - state.target;
      var change = (state.velocity + 16 * offset) * dt;
      var decay = Math.exp(-16 * dt);
      state.position = state.target + (offset + change) * decay;
      state.velocity = (state.velocity - 16 * change) * decay;
      if (Math.abs(state.position - state.target) > .002 || Math.abs(state.velocity) > .02) moving = true;
    });
    paintFields();
    if (moving) fieldFrame = requestAnimationFrame(animateFields);
    else settleFields();
  }

  function selectField(id) {
    var nextIndex = sections.findIndex(function (section) { return section.id === id; });
    if (nextIndex < 0 || nextIndex === selectedIndex) return;
    var animate = singleFieldView.matches && !reducedMotion.matches &&
      !document.documentElement.classList.contains('motion-paused');
    var direction = Math.sign(nextIndex - selectedIndex);
    // An unseen panel starts on the side implied by the tab order. A panel
    // already in flight keeps its current position instead of jumping back.
    if (!sections[nextIndex].classList.contains('is-transitioning')) {
      fieldMotion[nextIndex].position = direction;
      fieldMotion[nextIndex].velocity = 0;
    }
    selectedIndex = nextIndex;
    fieldMotion.forEach(function (state, index) {
      var visible = state.section.classList.contains('is-current') ||
        state.section.classList.contains('is-transitioning') || index === nextIndex;
      state.target = Math.sign(index - nextIndex);
      state.section.classList.toggle('is-current', index === nextIndex);
      state.section.classList.toggle('is-transitioning', animate && visible);
      state.section.inert = singleFieldView.matches && index !== nextIndex;
      state.section.setAttribute('aria-hidden', String(state.section.inert));
      if (animate && visible) state.rail.style.willChange = 'transform, opacity';
    });
    fieldButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.field === id));
    });
    if (animate) {
      paintFields();
      if (!fieldFrame) fieldFrame = requestAnimationFrame(animateFields);
    } else settleFields();
    drawConnections();
  }
  settleFields();
  singleFieldView.addEventListener('change', function () { settleFields(); drawConnections(); });
  reducedMotion.addEventListener('change', settleFields);
  fieldButtons.forEach(function (button) {
    button.addEventListener('click', function () { selectField(button.dataset.field); });
  });

  var atlas = document.querySelector('.atlas');
  var canvas = document.querySelector('.connections');
  if (!atlas || !canvas) return;
  var group = canvas.querySelector('g');
  var namespaceURI = 'http://www.w3.org/2000/svg';
  var defs = document.createElementNS(namespaceURI, 'defs');
  canvas.insertBefore(defs, canvas.firstChild);
  var points = Array.from(document.querySelectorAll('[data-connect]'));
  var namespace = 'http://www.w3.org/2000/svg';
  var connections = points.map(function (point, index) {
    var target = document.getElementById(point.dataset.connect);
    var path = document.createElementNS(namespace, 'path');
    var dot = document.createElementNS(namespace, 'circle');
    path.setAttribute('class', 'connection');
    path.dataset.connection = point.dataset.connect;
    var clip = document.createElementNS(namespace, 'clipPath');
    var reveal = document.createElementNS(namespace, 'rect');
    clip.setAttribute('id', 'connection-clip-' + point.dataset.connect);
    reveal.setAttribute('class', 'connection-reveal');
    reveal.style.setProperty('--connection-index', index);
    clip.appendChild(reveal);
    defs.appendChild(clip);
    path.setAttribute('clip-path', 'url(#connection-clip-' + point.dataset.connect + ')');
    dot.setAttribute('class', 'connection-dot');
    dot.dataset.endpoint = point.dataset.connect;
    dot.style.setProperty('--connection-index', index);
    dot.setAttribute('r', '4');
    group.appendChild(path);
    group.appendChild(dot);
    return {point: point, target: target, title: target && target.querySelector('h2'), path: path, dot: dot, reveal: reveal};
  });

  // Measure the actual layout so connections follow type, viewport and image
  // sizes. Narrow screens switch fields without moving the page vertically.
  function drawConnections() {
    var bounds = atlas.getBoundingClientRect();
    canvas.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height);
    connections.forEach(function (connection) {
      var point = connection.point, target = connection.target;
      var path = connection.path, dot = connection.dot;
      var visible = target && target.getClientRects().length > 0 &&
        (!singleFieldView.matches || target.classList.contains('is-current'));
      path.style.display = dot.style.display = visible ? '' : 'none';
      if (!visible) return;
      var start = point.getBoundingClientRect();
      var x1 = start.left + start.width / 2 - bounds.left;
      var y1 = start.top + start.height / 2 - bounds.top;
      var title = connection.title.getBoundingClientRect();
      var x2 = title.left - bounds.left - 13;
      var y2 = title.top + title.height / 2 - bounds.top;
      var bend = Math.max(30, (x2 - x1) * .5);
      // The curve comes from the drop between its ends, so a connector running
      // nearly level has no shape of its own and draws as a rule. This sags the
      // control points to give that one a belly, like a slack wire, and fades
      // out as the drop grows - the steep connectors are already curves and
      // want nothing added.
      var sag = Math.max(0, 1 - Math.abs(y2 - y1) / 150) * 54;
      path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + (x1 + bend) + ',' + (y1 + sag) + ' ' + (x2 - bend) + ',' + (y2 + sag) + ' ' + x2 + ',' + y2);
      dot.setAttribute('cx', x2);
      dot.setAttribute('cy', y2);
      // The wipe scales from the rect's own left edge, so the rect has to be
      // the line's own box - padded out past the stroke and its round caps.
      var box = path.getBBox();
      connection.reveal.setAttribute('x', box.x - 12);
      connection.reveal.setAttribute('y', box.y - 12);
      connection.reveal.setAttribute('width', box.width + 24);
      connection.reveal.setAttribute('height', box.height + 24);
    });
  }

  function highlight(id, active) {
    connections.forEach(function (connection) {
      if (connection.point.dataset.connect === id) connection.path.classList.toggle('is-active', active);
    });
  }
  points.forEach(function (point) {
    point.addEventListener('click', function (event) {
      event.preventDefault();
      selectField(point.dataset.connect);
    });
    var section = document.getElementById(point.dataset.connect);
    [point, section].forEach(function (element) {
      if (!element) return;
      element.addEventListener('mouseenter', function () { highlight(point.dataset.connect, true); });
      element.addEventListener('mouseleave', function () { highlight(point.dataset.connect, false); });
      element.addEventListener('focusin', function () { highlight(point.dataset.connect, true); });
      element.addEventListener('focusout', function (event) {
        if (!element.contains(event.relatedTarget)) highlight(point.dataset.connect, false);
      });
    });
  });

  drawConnections();
  if (window.ResizeObserver) new ResizeObserver(drawConnections).observe(atlas);
  else window.addEventListener('resize', drawConnections);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawConnections);

  // Keep leaders attached to their actual positions inside the moving artwork.
  var previousDraw = 0;
  function followCell(timestamp) {
    if (!document.hidden && !reducedMotion.matches &&
        !document.documentElement.classList.contains('motion-paused') && timestamp - previousDraw >= 32) {
      drawConnections();
      previousDraw = timestamp;
    }
    window.requestAnimationFrame(followCell);
  }
  window.requestAnimationFrame(followCell);
})();
