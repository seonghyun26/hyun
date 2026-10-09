(function () {
  'use strict';
  var host = document.querySelector('.protein-ngl');
  if (!host || !window.NGL) return;
  var rendering = window.ResearchRendering;
  var model = window.ResearchProtein = rendering.createRenderer(host, 'research-protein-change', {
    sampleLevel: 2, cameraType: 'perspective', ambientIntensity: .65, lightIntensity: 1.1
  });
  window.researchProteinReady = model.readyPromise;
  if (model.failed) return;
  var stage = model.stage;
  Promise.resolve().then(function () {
    return Promise.all([
      stage.loadFile(host.dataset.structure, {ext: 'pdb', firstModelOnly: true}),
      fetch(host.dataset.motion).then(function (response) {
        if (!response.ok) throw new Error('Protein coordinates unavailable');
        return response.json();
      })
    ]);
  }).then(function (results) {
    if (model.failed) return;
    var component = results[0], motion = results[1], structure = component.structure;
    if (motion.folded.length !== structure.atomCount * 3 || motion.extended.length !== motion.folded.length) {
      throw new Error('Protein atom count mismatch');
    }
    var coordinates = new Float32Array(motion.folded.length);
    var palette = rendering.atomColorScheme(rendering.palette.proteinCarbon);
    component.addRepresentation('cartoon', {sele: 'protein', color: rendering.palette.ribbon,
      radiusScale: .85, aspectRatio: 4, subdiv: 12, smoothSheet: true,
      roughness: .48, metalness: 0, opacity: 1});
    component.addRepresentation('licorice', {sele: 'not hydrogen', colorScheme: palette,
      radiusType: 'size', radiusSize: .14, multipleBond: 'off',
      roughness: .4, metalness: 0, opacity: 1});
    // Ease from an upper-left to lower-right diagonal open chain to the
    // oblique hairpin view, while moving inward through the cytoplasm.
    stage.viewerControls.center([0, 0, 0]);
    var previousFold = -1;
    model.update = function (fold) {
      if (Math.abs(fold - previousFold) < .0005) return;
      previousFold = fold;
      var pose = rendering.proteinPose(fold);
      var eased = pose.inward;
      // Percent translation follows the artwork scale at every viewport.
      host.style.transform = 'translate(' + (pose.offsetX / 360 * 100) + '%, ' + (pose.offsetY / 260 * 100) + '%)';
      var rotation = [-.10 * eased, .16 * eased,
        .300706 * (1 - eased) - .46175 * eased, .953717 * (1 - eased) + .866 * eased];
      var magnitude = Math.hypot.apply(Math, rotation);
      stage.viewerControls.rotate(rotation.map(function (value) { return value / magnitude; }));
      for (var i = 0; i < coordinates.length; i++) {
        coordinates[i] = motion.extended[i] * (1 - fold) + motion.folded[i] * fold;
      }
      structure.updatePosition(coordinates);
      component.updateRepresentations({position: true});
      // Give the extended diagonal more space; compensate less as the
      // chain compacts so the folded protein settles at a smaller size.
      stage.viewerControls.distance(34.375 - 6.375 * eased);
      host.dataset.conformation = pose.conformation;
    };
    model.update(1);
    stage.tasks.onZeroOnce(model.complete);
  }).catch(model.fail);
})();
