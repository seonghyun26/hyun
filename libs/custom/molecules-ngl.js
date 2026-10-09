(function () {
  'use strict';
  var host = document.querySelector('.molecules-ngl');
  if (!host || !window.NGL) return;
  var rendering = window.ResearchRendering;
  var api = window.ResearchMolecules = rendering.createRenderer(host, 'research-molecules-change', {
    cameraType: 'orthographic', sampleLevel: 1, ambientIntensity: .62, lightIntensity: 1.1
  });
  window.researchMoleculesReady = api.readyPromise;
  var stage = api.stage;
  var components = [];
  function molfile(atoms, bonds) {
    var lines = ['Cell molecule', '  Research vision', '',
      String(atoms.length).padStart(3) + String(bonds.length).padStart(3) + '  0  0  0  0            999 V2000'];
    atoms.forEach(function (atom) {
      // The camera looks from -Z. These signs map molecular coordinates
      // directly to the cell image's right/down pixel coordinate system.
      lines.push(atom.slice(0,3).map(function (v) { return (-v/10).toFixed(4).padStart(10); }).join('') +
        ' ' + atom[3].padEnd(3) + ' 0  0  0  0  0  0  0  0  0  0  0  0');
    });
    bonds.forEach(function (bond) {
      lines.push(String(bond[0]+1).padStart(3) + String(bond[1]+1).padStart(3) + '  1  0  0  0  0');
    });
    return lines.concat(['M  END', '$$$$']).join('\n');
  }
  api.setup = function (smallAtoms, smallBonds, largeAtoms, largeBonds) {
    if (api.failed) return;
    try {
      stage.viewerControls.center([0,0,0]);
      // A constant orthographic field of 119.9 world units matches the
      // artwork's 1199 pixels; resizing never changes the docking alignment.
      api.afterResize = function () {
        // NGL resizes the orthographic bounds without refreshing its zoom.
        // Reapply distance so atoms stay aligned with the resized cell plate.
        stage.viewerControls.distance(rendering.artwork.height / 10 / (2 * Math.tan(Math.PI / 9)));
      };
      api.afterResize();
      var palette = rendering.atomColorScheme(rendering.palette.carbon);
      var small = molfile(smallAtoms, smallBonds), large = molfile(largeAtoms, largeBonds);
      Promise.all([small, large, small].map(function (data) {
        return stage.loadFile(new Blob([data], {type: 'text/plain'}), {ext: 'sdf'});
      })).then(function (loaded) {
        if (api.failed) return;
        components = loaded;
        components.forEach(function (component) {
          component.addRepresentation('ball+stick', {
            sele: 'not hydrogen', colorScheme: palette,
            radiusType: 'size', radiusSize: .28,
            aspectRatio: 2.86, multipleBond: 'off',
            roughness: .42, metalness: 0, opacity: 1});
        });
        stage.tasks.onZeroOnce(api.complete);
      }).catch(api.fail);
    } catch (error) { api.fail(); }
  };
  api.update = function (index, x, y, scale, angle, tilt) {
    if (!api.ready) return;
    var component = components[index];
    var sx = Math.sin(tilt/2), cx = Math.cos(tilt/2), sz = Math.sin(angle/2), cz = Math.cos(angle/2);
    component.setRotation([sx*cz, -sx*sz, cx*sz, cx*cz]);
    component.setScale(scale);
    component.setPosition([(rendering.artwork.width/2-x)/10, (rendering.artwork.height/2-y)/10, 0]);
  };
})();
