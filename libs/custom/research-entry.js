(function () {
  'use strict';
  var prefetched = false;
  document.querySelectorAll('a.research-entry').forEach(function (link) {
    function prefetch() {
      if (prefetched) return;
      prefetched = true;
      var hint = document.createElement('link');
      hint.rel = 'prefetch'; hint.href = link.href;
      document.head.appendChild(hint);
    }
    link.addEventListener('pointerenter', prefetch, { once: true });
    link.addEventListener('focus', prefetch, { once: true });
  });
  // Open a native new tab immediately; loading belongs to the destination.
  var loader = document.getElementById('research-loader');
  if (!loader) return;
  var elements = Array.from(document.body.children).filter(function (element) {
    return element !== loader && !element.inert && element.tagName !== 'SCRIPT';
  });
  elements.forEach(function (element) { element.inert = true; });
  loader.setAttribute('aria-hidden', 'false');
  var frame = 0;
  var dockingCanvas = loader.querySelector('.loader-docking');
  var dockingContext = dockingCanvas && dockingCanvas.getContext('2d');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var duration = 2700;
  var timer;
  var finished = false;
  var pageReady = false;
  var animationUnavailable = false;
  var minimumDockShown = false;
  var readyTimer;
  function markPageReady() {
    if (finished || pageReady) return;
    pageReady = true;
    clearTimeout(readyTimer);
    loader.classList.add('page-ready');
    if (animationUnavailable || (reducedMotion.matches && minimumDockShown)) finish();
  }
  function waitForImage(url) {
    return new Promise(function (resolve) {
      var image = new Image();
      image.onload = function () {
        if (image.decode) image.decode().catch(function () {}).then(resolve);
        else resolve();
      };
      image.onerror = resolve;
      image.src = url;
    });
  }
  // Include lazy gallery images and the animated cell plate, so revealing the
  // page does not start a second visible round of image loading.
  var imageUrls = Array.from(document.querySelectorAll('.cell-base, .paper-image img')).map(function (image) { return image.currentSrc || image.src; });
  var cell = document.querySelector('.cell-base');
  if (cell && cell.dataset.motionSrc) imageUrls.push(cell.dataset.motionSrc);
  var ambient = document.querySelector('.ambient-image');
  var background = ambient && getComputedStyle(ambient).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
  if (background) imageUrls.push(background[1]);
  var assets = Array.from(new Set(imageUrls)).map(waitForImage);
  if (document.fonts) assets.push(document.fonts.ready);
  if (window.researchProteinReady) assets.push(window.researchProteinReady);
  if (window.researchMoleculesReady) assets.push(window.researchMoleculesReady);
  Promise.all(assets).then(markPageReady, markPageReady);
  // A stalled resource must not leave navigation blocked indefinitely.
  readyTimer = setTimeout(markPageReady, 12000);
  function skipMissingAnimation() {
    animationUnavailable = true;
    clearTimeout(timer);
    if (pageReady) finish();
  }
  if (dockingContext) {
    var ctx = dockingContext;
    var pocket = new Image();
    var ligand = [[-13,0],[-6.5,-11],[6.5,-11],[13,0],[6.5,11],[-6.5,11],[25,-4],[32,5]];
    var bonds = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,6],[6,7]];
    function ease(value) { return value * value * (3 - 2 * value); }
    function drawDocking(dock) {
      ctx.clearRect(0, 0, dockingCanvas.width, dockingCanvas.height);
      ctx.save();
      ctx.scale(dockingCanvas.width / 280, dockingCanvas.height / 200);
      // Illustrative surface pocket, matching the receptor inside the cell.
      var height = 174, width = height * pocket.naturalWidth / pocket.naturalHeight;
      ctx.drawImage(pocket, 120 - width / 2, 13, width, height);
      // Keep the ligand's full silhouette inside the cavity at the bound
      // pose, at the same relative scale as the receptor in the cell.
      // Offset the ring slightly left of the cavity center so its side chain
      // also sits inside the pocket at the final pose (122, 106).
      var x = 166 - dock * 44, y = 78 + dock * 28;
      if (dock > 0) {
        var glow = ctx.createRadialGradient(x, y, 2, x, y, 29);
        glow.addColorStop(0, 'rgba(71,97,242,' + (dock * .18) + ')');
        glow.addColorStop(1, 'rgba(71,97,242,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, 29, 0, Math.PI * 2); ctx.fill();
      }
      ctx.translate(x, y);
      ctx.rotate(-.65 + dock * .85);
      var ligandScale = 1.08 - dock * .24;
      ctx.scale(ligandScale, ligandScale);
      ctx.lineCap = 'round';
      bonds.forEach(function (bond) {
        var a = ligand[bond[0]], b = ligand[bond[1]];
        ctx.strokeStyle = '#8092f6'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.strokeStyle = '#dde3ff'; ctx.lineWidth = .8;
        ctx.stroke();
      });
      ligand.forEach(function (atom, index) {
        var color = index === 7 ? '#e58bbc' : index === 2 ? '#a088e0' : '#8092f6';
        var sphere = ctx.createRadialGradient(atom[0] - 1.3, atom[1] - 1.95, .2, atom[0], atom[1], 4.81);
        sphere.addColorStop(0, '#f4f3ff'); sphere.addColorStop(.45, color); sphere.addColorStop(1, '#5a6dbe');
        ctx.fillStyle = sphere;
        ctx.beginPath(); ctx.arc(atom[0], atom[1], 4.81, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }
    var started;
    function dockDrug(now) {
      if (finished) return;
      var progress = ((now - started) % duration) / duration;
      // Finish only while the ligand is inside the pocket. If assets are
      // still loading, release and approach again for as many cycles as needed.
      var dock = progress < .1 ? 0 : progress < .4 ? ease((progress - .1) / .3) :
        progress < .6 ? 1 : progress < .9 ? 1 - ease((progress - .6) / .3) : 0;
      drawDocking(dock);
      loader.dataset.docking = dock === 1 ? 'bound' : 'moving';
      if (dock === 1 && progress >= .46 && pageReady) finish();
      else frame = requestAnimationFrame(dockDrug);
    }
    pocket.onload = function () {
      if (finished || animationUnavailable) return;
      clearTimeout(timer);
      drawDocking(reducedMotion.matches ? 1 : 0);
      started = performance.now();
      loader.classList.add('is-ready');
      if (!reducedMotion.matches) frame = requestAnimationFrame(dockDrug);
      else timer = setTimeout(function () {
        minimumDockShown = true;
        if (pageReady) finish();
      }, duration * .46);
    };
    pocket.onerror = skipMissingAnimation;
    // Never trap the page behind a missing or stalled illustration.
    timer = setTimeout(skipMissingAnimation, 3000);
    pocket.src = dockingCanvas.dataset.pocketSrc;
  } else {
    skipMissingAnimation();
  }
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    clearTimeout(readyTimer);
    cancelAnimationFrame(frame);
    document.documentElement.classList.remove('research-is-loading');
    loader.setAttribute('aria-hidden', 'true');
    elements.forEach(function (element) { element.inert = false; });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') finish();
  });
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) finish();
  });
})();
