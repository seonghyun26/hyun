(function () {
  'use strict';
  var canvas = document.querySelector('.cell-processes');
  var base = document.querySelector('.cell-base');
  if (!canvas || !base) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var running = false;
  var elapsed = 0;
  var previous = 0;
  var frame = 0;
  var lastDraw = 0;
  var image = new Image();
  var rendering = window.ResearchRendering;
  var artwork = rendering.artwork;
  var proteinPoint = document.querySelector('.cell-point--proteins');

  // Coordinates share the artwork's 1312 × 1199 space. These are illustrative
  // conformations, not a trajectory from a molecular dynamics simulation.
  var colors = {
    C: ['#5a6dbe', '#dde3ff', '#8092f6'],
    O: ['#a86c99', '#ffdeee', '#e58bbc'],
    N: ['#7b6ab6', '#e8e0ff', '#a088e0']
  };
  var atoms = [
    [-27,0,0,'C'], [-14,-24,5,'C'], [14,-24,0,'N'], [28,0,-5,'C'],
    [14,24,0,'C'], [-14,24,6,'C'], [55,0,6,'O'], [-39,-23,-5,'H'],
    [21,-47,0,'H'], [23,47,7,'H'], [-35,43,0,'O']
  ];
  var bonds = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,6],[0,7],[2,8],[4,9],[5,10]];
  // Angular fused three-ring scaffold with six pendant heavy atoms.
  // Illustrative geometry: 20 heavy atoms, 22 bonds, three independent rings.
  var largeAtoms = [
    [15.0,-14.249,-3.78,'C'],
    [1.0,10.0,0.55,'C'],
    [-27.0,10.0,0.55,'C'],
    [-41.0,-14.249,-3.78,'C'],
    [-27.0,-38.497,-8.11,'C'],
    [1.0,-38.497,-8.11,'C'],
    [57.0,10.0,0.0,'C'],
    [43.0,34.249,4.33,'C'],
    [15.0,34.249,4.33,'C'],
    [43.0,-14.249,-4.33,'C'],
    [57.0,58.497,0.0,'C'],
    [43.0,82.746,4.33,'C'],
    [15.0,82.746,4.33,'C'],
    [1.0,58.497,0.0,'C'],
    [-65,-5,8,'N'],
    [-81,17,15,'C'],
    [-70,41,22,'O'],
    [9,-66,2,'C'],
    [33,-80,8,'O'],
    [81,72,13,'O']
  ];
  var largeBonds = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[0,5],[6,7],[7,8],[1,8],[0,9],[6,9],[10,11],[11,12],[12,13],[8,13],[7,10],[3,14],[14,15],[15,16],[5,17],[17,18],[10,19]
  ];
  if (window.ResearchMolecules) window.ResearchMolecules.setup(atoms, bonds, largeAtoms, largeBonds);
  function molecule(x, y, scale, angle, tilt, opacity, large, index) {
    if (window.ResearchMolecules && window.ResearchMolecules.ready) {
      window.ResearchMolecules.update(index, x, y, scale, angle, tilt);
      return;
    }
    var projected = (large ? largeAtoms : atoms).map(function (atom) {
      var rx = atom[0] * Math.cos(angle) - atom[1] * Math.sin(angle);
      var ry = atom[0] * Math.sin(angle) + atom[1] * Math.cos(angle);
      return { x: x + rx * scale, y: y + (ry * Math.cos(tilt) - atom[2] * Math.sin(tilt)) * scale,
        z: ry * Math.sin(tilt) + atom[2] * Math.cos(tilt), kind: atom[3] };
    });
    ctx.globalAlpha = opacity;
    ctx.lineCap = 'round';
    var primitives = (large ? largeBonds : bonds).map(function (bond) {
      var a = projected[bond[0]], b = projected[bond[1]];
      return {a: a, b: b, z: (a.z + b.z) / 2};
    }).filter(function (bond) { return bond.a.kind !== 'H' && bond.b.kind !== 'H'; });
    projected.forEach(function (atom) {
      if (atom.kind !== 'H') primitives.push({atom: atom, z: atom.z});
    });
    primitives.sort(function (a, b) { return a.z - b.z; }).forEach(function (primitive) {
      if (primitive.atom) {
        var atom = primitive.atom, radius = 8.008 * scale;
        var shades = colors[atom.kind];
        var sphere = ctx.createRadialGradient(atom.x - radius * .3, atom.y - radius * .35,
          radius * .08, atom.x, atom.y, radius);
        sphere.addColorStop(0, shades[1]);
        sphere.addColorStop(.5, shades[2]);
        sphere.addColorStop(1, shades[0]);
        ctx.fillStyle = sphere;
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      var a = primitive.a, b = primitive.b;
      var midpoint = {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
      var dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy) || 1;
      var diameter = 5.6 * scale;
      var nx = -dy / length * diameter / 2, ny = dx / length * diameter / 2;
      [[a, midpoint, a.kind], [midpoint, b, b.kind]].forEach(function (half) {
        var palette = colors[half[2]];
        var material = ctx.createLinearGradient(midpoint.x - nx, midpoint.y - ny, midpoint.x + nx, midpoint.y + ny);
        material.addColorStop(0, palette[0]);
        material.addColorStop(.35, palette[1]);
        material.addColorStop(1, palette[2]);
        ctx.strokeStyle = material;
        ctx.lineWidth = diameter;
        ctx.beginPath();
        ctx.moveTo(half[0].x, half[0].y);
        ctx.lineTo(half[1].x, half[1].y);
        ctx.stroke();
      });
    });
    ctx.globalAlpha = 1;
  }
  function protein(time) {
    var fold = reduced.matches ? 1 : Math.min(1, (1 - Math.cos((time + 3) * Math.PI * 2 / 8)) * .7);
    var pose = rendering.proteinPose(fold);
    canvas.dataset.conformation = pose.conformation;
    var inward = pose.inward;
    if (proteinPoint) {
      proteinPoint.style.left = (pose.x / artwork.width * 100) + '%';
      proteinPoint.style.top = (pose.y / artwork.height * 100) + '%';
    }
    if (window.ResearchProtein && window.ResearchProtein.ready) {
      window.ResearchProtein.update(fold);
      return;
    }
    // Keep every conformation below the membrane and above the docking lane.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(785,265);ctx.bezierCurveTo(890,240,1030,305,1095,425);
    ctx.lineTo(1095,490);ctx.lineTo(805,490);ctx.closePath();ctx.clip();
    ctx.translate(pose.x, pose.y);
    ctx.rotate(.78 * (1 - inward) - .6 * inward);
    window.ResearchRibbon.draw(ctx, 0, 0, 1.44 - .44 * inward, fold);
    ctx.restore();
  }
  function render(time) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save(); ctx.scale(canvas.width / artwork.width, canvas.height / artwork.height);
    protein(time);
    var phase = (time % 10) / 10;
    var dock = phase < .2 ? 0 : phase < .4 ? rendering.ease((phase - .2) / .2) : phase < .6 ? 1 : phase < .8 ? 1 - rendering.ease((phase - .6) / .2) : 0;
    canvas.dataset.docking = dock === 1 ? 'bound' : dock === 0 ? 'free' : 'moving';
    // Ligand settles inside the existing receptor pocket, then leaves it.
    molecule(1090 - dock * 160, 494 + dock * 156, .78 - dock * .16, -.5 + dock * .85, .45 + dock * .2, .94, false, 0);
    [
      [850,885,1.08,0,true], [1040,1010,.58,2.1,false]
    ].forEach(function (item, index) {
      var drift = time * .55 + item[3];
      molecule(item[0] + Math.sin(drift) * 19, item[1] + Math.cos(drift * .8) * 16, item[2], Math.sin(drift) * .3, .5 + Math.sin(drift) * .22, .86, item[4], index + 1);
    });
    ctx.restore();
  }
  function resize() {
    var density = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * density));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * density));
    render(elapsed / 1000);
  }
  function tick(timestamp) {
    if (!running) return;
    var delta = previous ? Math.min(timestamp - previous, 100) : 0;
    previous = timestamp;
    elapsed += delta;
    if (timestamp - lastDraw >= 32) { render(elapsed / 1000); lastDraw = timestamp; }
    frame = requestAnimationFrame(tick);
  }
  function updatePlayback() {
    var shouldRun = !document.hidden && !reduced.matches && !document.documentElement.classList.contains('motion-paused');
    if (shouldRun === running) return;
    running = shouldRun;
    cancelAnimationFrame(frame);
    previous = 0;
    if (running) frame = requestAnimationFrame(tick);
  }
  image.onload = function () {
    // Keep the complete static artwork if the motion plate cannot load.
    base.src = image.src;
    resize();
    window.addEventListener('research-protein-change', function () { render(elapsed / 1000); });
    window.addEventListener('research-molecules-change', function () { render(elapsed / 1000); });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    new MutationObserver(updatePlayback).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', updatePlayback);
    reduced.addEventListener('change', updatePlayback);
    updatePlayback();
  };
  image.src = base.dataset.motionSrc;
})();
