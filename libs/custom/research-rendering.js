(function () {
  'use strict';

  // Shared artwork coordinates keep WebGL, Canvas and connection anchors aligned.
  var artwork = {width: 1312, height: 1199};
  var palette = {carbon: 0x8092f6, oxygen: 0xe58bbc, nitrogen: 0xa088e0,
    proteinCarbon: 0xb7caee, ribbon: 0xb39aee};

  function ease(value) { return value * value * (3 - 2 * value); }

  function proteinPose(fold) {
    var inward = ease(fold);
    var offsetX = -35 + 40 * inward;
    var offsetY = -40 + 45 * inward;
    return {inward: inward, offsetX: offsetX, offsetY: offsetY,
      x: 935 + offsetX, y: 390 + offsetY,
      conformation: fold === 1 ? 'folded' : fold < .03 ? 'unfolded' : 'transition'};
  }

  function atomColorScheme(carbon) {
    return NGL.ColormakerRegistry.addScheme(function () {
      this.atomColor = function (atom) {
        return atom.element === 'O' ? palette.oxygen : atom.element === 'N' ? palette.nitrogen : carbon;
      };
    });
  }

  // Both renderers settle their readiness promise even on failure, allowing
  // the loader to finish and Canvas to take over after a lost WebGL context.
  function createRenderer(host, changeEvent, options) {
    var resolveReady, observer;
    var renderer = {ready: false, failed: false};
    renderer.readyPromise = new Promise(function (resolve) { resolveReady = resolve; });
    function notify() { window.dispatchEvent(new Event(changeEvent)); }
    renderer.resize = function () {
      renderer.stage.handleResize();
      if (renderer.afterResize) renderer.afterResize();
    };
    renderer.fail = function () {
      if (renderer.failed) return;
      renderer.failed = true;
      renderer.ready = false;
      host.dataset.renderer = 'fallback';
      if (observer) observer.disconnect();
      if (renderer.stage) renderer.stage.dispose();
      notify();
      resolveReady();
    };
    renderer.complete = function () {
      if (renderer.failed || renderer.ready) return;
      renderer.ready = true;
      host.dataset.renderer = 'ngl';
      renderer.resize();
      observer = new ResizeObserver(renderer.resize);
      observer.observe(host);
      notify();
      resolveReady();
    };
    try {
      renderer.stage = new NGL.Stage(host, Object.assign({
        backgroundColor: 'white', quality: 'high', cameraFov: 40,
        lightIntensity: 1.05, fogNear: 100, fogFar: 100,
        tooltip: false, workerDefault: false
      }, options));
      // NGL clears with alpha=0; remove its default CSS background as well.
      renderer.stage.viewer.renderer.domElement.style.backgroundColor = 'transparent';
      renderer.stage.mouseControls.clear();
      renderer.stage.keyControls.clear();
      renderer.stage.viewer.renderer.domElement.addEventListener('webglcontextlost', renderer.fail, {once: true});
    } catch (error) { renderer.fail(); }
    return renderer;
  }

  window.ResearchRendering = {artwork: artwork, palette: palette, ease: ease,
    proteinPose: proteinPose, atomColorScheme: atomColorScheme, createRenderer: createRenderer};
})();
