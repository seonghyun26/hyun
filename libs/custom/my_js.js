$(document).ready(function() {

  // Variables
  var $nav = $('.navbar'),
      $body = $('body'),
      $window = $(window),
      navOffsetTop = $nav.offset().top;

  function init() {
    $window.on('scroll', onScroll)
    $window.on('resize', resize)
    $('a[href^="#"], .navbar-link').on('click', smoothScroll)

    onScroll();
    buildTOC();
  }

  function sectionScrollTop(section) {
    var inset = $nav.is(':visible') ? $nav.outerHeight() + 16 : 16;
    var scroller = document.scrollingElement || document.documentElement;
    var maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    return Math.max(0, Math.min($(section).offset().top - inset, maxScroll));
  }

  function smoothScroll(e) {
    var target = this.hash;
    // Project links have their own modal handler, not a matching section ID.
    if (!target || target.indexOf('#side-project-') === 0) return;
    var section = document.getElementById(target.slice(1));
    if (!section) return;
    e.preventDefault();
    // The duration used to be 0, which is a jump, not a scroll. The hash is set
    // with replaceState rather than location.hash so the browser does not undo
    // the animation by snapping to the anchor at the end.
    $('html, body').stop().animate({
        'scrollTop': sectionScrollTop(section)
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600, 'swing', function () {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', target);
        } else {
          window.location.hash = target;
        }
        $window.trigger('toc:update');
    });
  }

  function resize() {
    if ($body.hasClass('has-overlay')) return;
    $body.removeClass('has-docked-nav')
    navOffsetTop = $nav.offset().top
    onScroll()
  }

  function onScroll() {
    if ($body.hasClass('has-overlay')) return;
    if(navOffsetTop < $window.scrollTop() && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav')
    }
    if(navOffsetTop > $window.scrollTop() && $body.hasClass('has-docked-nav')) {
      $body.removeClass('has-docked-nav')
    }
  }

  function buildTOC() {
    // No heading: the list of section names is its own label, and a "Contents"
    // title only costs height in a panel that is already small.
    var toc = $('<div id="floating-toc" aria-label="Contents"><ul></ul></div>');
    var $sections = $('.docs-section').filter(function() {
      return this.id && $(this).find('h4').length;
    });
    
    if ($sections.length === 0) return;

    $sections.each(function() {
      var id = $(this).attr('id');
      var title = $(this).find('h4').first().text();
      if (id && title) {
        toc.find('ul').append('<li><a href="#' + id + '">' + title + '</a></li>');
      }
    });

    $('body').append(toc);

    // Smooth scroll for TOC links
    $('#floating-toc a').on('click', smoothScroll);

    // Highlight active section and shift TOC on scroll
    var lastScrollTop = 0;
    function updateTOC() {
      var scrollTop = $window.scrollTop();

      // Subtle vertical shift based on scroll direction
      var delta = scrollTop - lastScrollTop;
      var shift = Math.max(-8, Math.min(8, delta * 0.3));
      var $toc = $('#floating-toc');
      $toc.css('transform', 'translateY(calc(-50% + ' + shift + 'px))');

      // Highlight active section
      var currentId = '';
      $sections.each(function(i) {
        // Use the same reachable position as a TOC click. Short final sections
        // cannot always reach the top of the viewport, especially when folded.
        //
        // The first section reaches back to the top of the page: the header and
        // the navbar above it are still part of the section you are reading, so
        // Bio is current from the very first pixel rather than only once its own
        // heading is reached - which otherwise left nothing marked at all.
        var sectionTop = i === 0 ? 0 : sectionScrollTop(this);
        if (scrollTop + 2 >= sectionTop) {
          currentId = $(this).attr('id');
        }
      });

      $toc.find('a').removeClass('active').removeAttr('aria-current');
      if (currentId) {
        $toc.find('a[href="#' + currentId + '"]').addClass('active').attr('aria-current', 'location');
      }

      lastScrollTop = scrollTop;
    }
    $window.on('scroll resize toc:update', updateTOC);
    if (window.ResizeObserver) {
      var tocObserver = new ResizeObserver(updateTOC);
      tocObserver.observe(document.querySelector('.container'));
    }
    updateTOC();
  }


  // A viewport overlay must live outside the horizontally scrolling card rail.
  // In particular, iOS can clip fixed descendants of a touch scroller.
  $('.side-project-modal').appendTo($body);

  // A phone hides and shows its toolbars as you scroll, so the height the page
  // is laid out at is not the height you can see. iOS reports the taller one for
  // 100vh, and has no dvh at all before 16.4, which leaves an overlay sized that
  // way hanging off both ends of the screen. Measure the visible viewport and
  // let the overlays follow it.
  var visualViewport = window.visualViewport;
  function syncOverlayViewport() {
    var height = visualViewport ? visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--overlay-viewport', height + 'px');
  }
  if (visualViewport) {
    visualViewport.addEventListener('resize', syncOverlayViewport);
    visualViewport.addEventListener('scroll', syncOverlayViewport);
  }
  $window.on('resize orientationchange', syncOverlayViewport);
  syncOverlayViewport();

  // One scroll lock for every overlay. Hiding the body's overflow does not stop
  // an iOS page scrolling underneath, so the body is pinned at the offset it was
  // read at and put back there on the way out.
  var lockedScrollTop = 0;
  var lockedBodyTop = '';
  function lockPageScroll() {
    if ($body.hasClass('has-overlay')) return;
    $('html, body').stop();
    syncOverlayViewport();
    lockedScrollTop = $window.scrollTop();
    lockedBodyTop = document.body.style.top;
    $body.css('top', -lockedScrollTop + 'px').addClass('has-overlay');
  }
  function unlockPageScroll() {
    if (!$body.hasClass('has-overlay')) return;
    $body.removeClass('has-overlay').css('top', lockedBodyTop);
    window.scrollTo(0, lockedScrollTop);
    resize();
  }

  var projectTrigger = null;

  function openProjectModal(index, trigger) {
    var $modal = $('#side-project-modal-' + index);
    if (!$modal.length || $('.side-project-modal.open').length) return;
    lockPageScroll();
    projectTrigger = trigger;
    $modal.addClass('open').attr('aria-hidden', 'false');
    $modal.find('.side-project-modal-body').scrollTop(0);
    $modal.find('.side-project-modal-close')[0].focus({ preventScroll: true });
  }

  function closeProjectModal() {
    if (!$('.side-project-modal.open').length) return;
    $('.side-project-modal.open').removeClass('open').attr('aria-hidden', 'true');
    unlockPageScroll();
    if (projectTrigger) projectTrigger.focus({ preventScroll: true });
    projectTrigger = null;
  }

  // Handle links that open a side project modal (e.g. #side-project-amd)
  $(document).on('click', 'a[href^="#side-project-"]', function(e) {
    e.preventDefault();
    var slug = $(this).attr('href').replace('#side-project-', '').toLowerCase();
    var $card = $('.side-project-card').filter(function() {
      return $(this).data('project-slug') === slug;
    });
    if ($card.length) {
      openProjectModal($card.data('project-index'), this);
    }
  });

  // Side project modals
  $('.side-project-card').on('click keydown', function(e) {
    // Don't open modal if clicking the GitHub link
    if ($(e.target).closest('.side-project-github-link').length) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    var index = $(this).data('project-index');
    openProjectModal(index, this);
  });

  // The cards sit in a horizontal, snapping scroller, which on a touch screen
  // can swallow a tap: a few pixels of finger travel count as a scroll and no
  // click is ever dispatched. Recognise the tap ourselves, with the tolerance a
  // browser would use. openProjectModal ignores the second call if the click
  // does arrive after all.
  var cardTap = null;
  $('.side-project-card').on('pointerdown', function(e) {
    var native = e.originalEvent || e;
    if (native.pointerType === 'mouse') return;
    cardTap = { card: this, x: e.clientX, y: e.clientY, at: Date.now() };
  });
  $('.side-project-card').on('pointerup', function(e) {
    var tap = cardTap;
    cardTap = null;
    if (!tap || tap.card !== this) return;
    var travel = Math.abs(e.clientX - tap.x) + Math.abs(e.clientY - tap.y);
    if (travel > 12 || Date.now() - tap.at > 700) return;
    if ($(e.target).closest('.side-project-github-link').length) return;
    e.preventDefault();
    openProjectModal($(this).data('project-index'), this);
  });
  $('.side-project-card').on('pointercancel', function() { cardTap = null; });

  $('.side-project-modal-backdrop, .side-project-modal-close').on('click', function() {
    closeProjectModal();
  });

  $(document).on('keydown', function(e) {
    if (e.key === 'Escape') {
      closeProjectModal();
    }
    if (e.key === 'Tab' && $('.side-project-modal.open').length) {
      var $focusable = $('.side-project-modal.open').find('button, a[href], [tabindex="0"]').filter(':visible');
      var first = $focusable[0];
      var last = $focusable[$focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // The hobbies section starts collapsed, but a hidden iframe still loads, so a
  // dozen YouTube players were being fetched on every visit - far and away the
  // most expensive thing on the page, and all of it before anyone asked for it.
  // Give them their src when the section is opened.
  function loadHobbyVideos() {
    if ($('#hobbies-toggle').attr('aria-expanded') !== 'true' ||
        !$('#hobbies-music').hasClass('active')) return;
    $('#hobbies-content iframe[data-src]').each(function() {
      this.src = this.getAttribute('data-src');
      this.removeAttribute('data-src');
    });
  }

  // Unload hidden players to stop playback, including before a player is ready.
  // Keep their URLs for lazy loading when Music becomes visible again.
  function stopHobbyVideos() {
    $('#hobbies-content iframe[src]').each(function() {
      this.setAttribute('data-src', this.getAttribute('src'));
      this.removeAttribute('src');
    });
  }

  // Bind directly: the tab library stops the click from bubbling to ancestors.
  $('#hobbies-content .tab-nav .button').on('click', function() {
    if ($(this).attr('data-ref') === '#hobbies-music') loadHobbyVideos();
    else stopHobbyVideos();
  });

  // Keep the hint's space stable so fading it out never jumps the content.
  $('#hobbies-toggle').on('click keydown', function(e) {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    if (e.repeat) return;
    e.preventDefault();
    var expanded = $(this).attr('aria-expanded') !== 'true';
    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $(this).attr('aria-expanded', String(expanded));
    if (expanded) loadHobbyVideos();
    else stopHobbyVideos();
    // Interrupt from the current height instead of queuing extra toggles.
    $('#hobbies-content').stop(true, false).slideToggle(reducedMotion ? 0 : 550, 'swing');
    var $hint = $('#hobbies-hint').stop(true, false).attr('aria-hidden', String(expanded));
    if (expanded) {
      // Opening: the hint has done its job, so it gets out of the way quickly.
      $hint.fadeTo(reducedMotion ? 0 : 180, 0);
    } else {
      // Closing: it used to snap back while the section was still sliding away.
      // Let it surface at the fold's own pace, a beat after the fold starts.
      $hint.delay(reducedMotion ? 0 : 120).fadeTo(reducedMotion ? 0 : 430, 1);
    }
  });

  // Photo lightbox
  var photoItems = [];
  var currentPhotoIndex = 0;
  var photoTrigger = null;

  $('.photo-item').each(function() {
    photoItems.push({
      src: $(this).find('img').attr('src'),
      alt: $(this).find('img').attr('alt') || '',
      caption: $(this).find('.photo-caption').text() || '',
      location: $(this).find('.photo-location').text() || '',
      camera: $(this).data('camera') || '',
      date: $(this).data('date') || ''
    });
  });

  function showPhoto(index) {
    if (photoItems.length === 0) return;
    currentPhotoIndex = (index + photoItems.length) % photoItems.length;
    var photo = photoItems[currentPhotoIndex];
    var $lb = $('#photo-lightbox');
    var opening = !$lb.hasClass('open');
    if (opening) photoTrigger = document.activeElement;
    $lb.find('.photo-lightbox-content img').attr({ src: photo.src, alt: photo.alt });
    $lb.find('.photo-lightbox-caption').text(photo.caption);
    $lb.find('.photo-lightbox-location').text(photo.location);
    var $date = $lb.find('.photo-lightbox-date');
    if (photo.date) {
      $date.html('<i class="fa fa-calendar"></i> ' + photo.date).show();
    } else {
      $date.hide();
    }
    var $camera = $lb.find('.photo-lightbox-camera');
    if (photo.camera) {
      $camera.html('<i class="fa fa-camera"></i> ' + photo.camera).show();
    } else {
      $camera.hide();
    }
    lockPageScroll();
    $lb.addClass('open').attr('aria-hidden', 'false');
    if (opening) $lb.find('.photo-lightbox-close')[0].focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!$('#photo-lightbox').hasClass('open')) return;
    $('#photo-lightbox').removeClass('open').attr('aria-hidden', 'true');
    unlockPageScroll();
    if (photoTrigger) photoTrigger.focus({ preventScroll: true });
    photoTrigger = null;
  }

  $('.photo-item').on('click', function() {
    showPhoto($(this).data('photo-index'));
    // Some browsers do not focus a button on pointer activation.
    photoTrigger = this;
  });

  $('.photo-lightbox-close, .photo-lightbox-backdrop').on('click', closeLightbox);

  $('.photo-lightbox-prev').on('click', function(e) {
    e.stopPropagation();
    showPhoto(currentPhotoIndex - 1);
  });

  $('.photo-lightbox-next').on('click', function(e) {
    e.stopPropagation();
    showPhoto(currentPhotoIndex + 1);
  });

  $(document).on('keydown', function(e) {
    var $lb = $('#photo-lightbox');
    if (!$lb.hasClass('open')) return;
    if (['ArrowLeft', 'ArrowRight', 'Escape'].indexOf(e.key) !== -1) e.preventDefault();
    if (e.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'Tab') {
      var $buttons = $lb.find('button').filter(':visible');
      var first = $buttons[0];
      var last = $buttons[$buttons.length - 1];
      if (!$lb[0].contains(document.activeElement) ||
          (e.shiftKey && document.activeElement === first) ||
          (!e.shiftKey && document.activeElement === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    }
  });

  // Profile picture switcher
  //
  // Picking an icon - or the rotation timer - dissolves the new photo in patch
  // by patch. Every patch is painted onto one canvas: the patches used to be
  // absolutely positioned elements holding their own copy of the photo, and a
  // thousand of those is a thousand composited layers, which phones cannot
  // afford. They light up in a shuffled order rather than sweeping a direction,
  // so the photo appears to surface all over at once instead of being wiped on.
  var profileStage = document.getElementById('profile-pic');
  if (profileStage) {
    var $profileImg = $('#profile-pic-img');
    var $profileBtns = $('.profile-switch-btn');
    var profileTransition = JSON.parse(profileStage.getAttribute('data-transition'));
    var TILE_ROWS = profileTransition.patch_rows;
    var TILE_COLS = profileTransition.patch_columns;
    var PROFILE_DURATION = profileTransition.duration_ms;
    var TILE_FADE = Math.min(profileTransition.patch_fade_ms, PROFILE_DURATION);
    // Use the same YAML timing for both the stagger and each patch's own fade.
    var TILE_SPREAD = PROFILE_DURATION - TILE_FADE;
    var AUTO_SWITCH = profileTransition.auto_switch_ms || 0;
    var profileEase = buildEasing(profileTransition.easing);
    var profileRequest = 0;
    var activeProfileTransition = 0;
    var decodedPhotos = Object.create(null);
    var currentProfileSrc = $profileImg.attr('src');
    var dissolveCanvas = null;
    var dissolveFrame = 0;

    // The YAML names a CSS timing function, which a canvas has to evaluate for
    // itself. Sample the curve into a table once instead of solving it per
    // patch per frame.
    function buildEasing(spec) {
      var points = String(spec).match(/-?\d*\.?\d+/g);
      if (!points || points.length < 4) return function(t) { return t; };
      var x1 = +points[0], y1 = +points[1], x2 = +points[2], y2 = +points[3];
      function axis(p, a, b) {
        var q = 1 - p;
        return 3 * q * q * p * a + 3 * q * p * p * b + p * p * p;
      }
      var STEPS = 64;
      var table = new Float32Array(STEPS + 1);
      for (var i = 0; i <= STEPS; i++) {
        var x = i / STEPS;
        var lo = 0, hi = 1, mid = x;
        for (var k = 0; k < 20; k++) { // Bisect for the parameter that lands on x.
          mid = (lo + hi) / 2;
          if (axis(mid, x1, x2) < x) lo = mid; else hi = mid;
        }
        table[i] = axis(mid, y1, y2);
      }
      return function(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        var at = t * STEPS;
        var i = Math.floor(at);
        return table[i] + (table[i + 1] - table[i]) * (at - i);
      };
    }

    function prepareProfilePhoto(src) {
      if (!decodedPhotos[src]) {
        decodedPhotos[src] = new Promise(function(resolve, reject) {
          var photo = new Image();
          photo.onload = function() {
            if (photo.decode) photo.decode().then(function() { resolve(photo); }, reject);
            else resolve(photo);
          };
          photo.onerror = reject;
          photo.src = src;
        }).catch(function() {
          delete decodedPhotos[src]; // A later click can retry a failed load.
          return null;
        });
      }
      return decodedPhotos[src];
    }

    // Retain decoded images, and wait for readiness before starting a dissolve.
    $profileBtns.each(function() {
      prepareProfilePhoto($(this).data('image'));
      var selectedIcon = this.querySelector('.profile-switch-svg').cloneNode(true);
      selectedIcon.classList.add('profile-switch-svg--selected');
      this.appendChild(selectedIcon);
    });

    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // A click wants its feedback at once, so the colour wipes across in its own
    // brisk time. A change the photo made on its own has no such moment to
    // answer, so there the wipe is stretched to the length of the dissolve and
    // the two read as one movement.
    var CLICK_WIPE_MS = 320;

    function setActiveProfileBtn($btn, wipeMs) {
      var $previous = $profileBtns.filter('.active');
      var movingLeft = $profileBtns.index($btn) < $profileBtns.index($previous);
      var hiddenLeft = 'inset(0% 100% 0% 0%)';
      var hiddenRight = 'inset(0% 0% 0% 100%)';
      var shown = 'inset(0% 0% 0% 0%)';
      var enteringFrom = movingLeft ? hiddenRight : hiddenLeft;
      var leavingTo = movingLeft ? hiddenLeft : hiddenRight;

      // Capture each live colour mask before retargeting, including any icon
      // still exiting from a rapid earlier click.
      var masks = [];
      $profileBtns.each(function() {
        var icon = this.querySelector('.profile-switch-svg--selected');
        var running = icon.getAnimations ? icon.getAnimations() : [];
        var visible = $(this).hasClass('active') || running.length > 0;
        masks.push({
          icon: icon,
          start: visible ? window.getComputedStyle(icon).clipPath : enteringFrom,
          selected: this === $btn[0],
          visible: visible
        });
        running.forEach(function(animation) { animation.cancel(); });
      });

      $profileBtns.removeClass('active').attr('aria-pressed', 'false');
      $btn.addClass('active').attr('aria-pressed', 'true');
      masks.forEach(function(mask) {
        if (reduceMotion || !mask.icon.animate || (!mask.selected && !mask.visible)) return;
        mask.icon.animate([
          { clipPath: mask.start },
          { clipPath: mask.selected ? shown : leavingTo }
        ], { duration: wipeMs, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' });
      });
    }

    function swapProfilePic(src, $btn, wipeMs) {
      if (currentProfileSrc === src) {
        scheduleAutoSwitch();
        return;
      }
      currentProfileSrc = src;
      var request = ++profileRequest;
      prepareProfilePhoto(src).then(function(photo) {
        if (request !== profileRequest) return;
        if (!photo) {
          currentProfileSrc = $profileBtns.filter('.active').data('image');
          scheduleAutoSwitch();
          return;
        }
        beginProfileSwap(src, $btn, photo, wipeMs || CLICK_WIPE_MS);
      });
    }

    // A dissolve that is still running gets committed rather than dropped:
    // removing its canvas alone would snap the frame back to the photo before it.
    function endDissolve() {
      if (dissolveFrame) cancelAnimationFrame(dissolveFrame);
      dissolveFrame = 0;
      if (dissolveCanvas) {
        $profileImg.attr('src', dissolveCanvas.getAttribute('data-src'));
        dissolveCanvas.parentNode.removeChild(dissolveCanvas);
        dissolveCanvas = null;
      }
    }

    function beginProfileSwap(src, $btn, photo, wipeMs) {
      var transition = ++activeProfileTransition;
      setActiveProfileBtn($btn, wipeMs);
      endDissolve();

      var stageW = profileStage.clientWidth;
      var stageH = profileStage.clientHeight;
      var canvas = !reduceMotion && stageW > 0 && stageH > 0 && photo.naturalWidth
        ? document.createElement('canvas') : null;
      var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
      if (!ctx) {
        $profileImg.attr('src', src);
        scheduleAutoSwitch();
        return;
      }

      // Two device pixels per CSS pixel is already past what the dissolve can
      // show; a phone's third one only costs fill rate.
      var density = Math.min(window.devicePixelRatio || 1, 2);
      var pxW = Math.max(1, Math.round(stageW * density));
      var pxH = Math.max(1, Math.round(stageH * density));
      canvas.width = pxW;
      canvas.height = pxH;
      canvas.className = 'profile-dissolve';
      canvas.setAttribute('data-src', src);
      profileStage.appendChild(canvas);
      dissolveCanvas = canvas;

      // Redo the base image's object-fit: cover crop by hand, so each patch
      // shows exactly the pixels the finished photo will show in that spot.
      var scale = Math.max(pxW / photo.naturalWidth, pxH / photo.naturalHeight);
      var originX = (pxW - photo.naturalWidth * scale) / 2;
      var originY = (pxH - photo.naturalHeight * scale) / 2;

      // Patch edges land on whole device pixels so neighbours share an edge
      // exactly; a fractional one leaves a seam across the whole grid.
      var colEdges = [];
      var rowEdges = [];
      for (var c = 0; c <= TILE_COLS; c++) colEdges.push(Math.round(c * pxW / TILE_COLS));
      for (var r = 0; r <= TILE_ROWS; r++) rowEdges.push(Math.round(r * pxH / TILE_ROWS));

      var count = TILE_ROWS * TILE_COLS;
      var order = new Int32Array(count);
      for (var i = 0; i < count; i++) order[i] = i;
      // Fisher-Yates: the patches are laid out in reading order but have to come
      // up in a scattered one, so shuffle the turn order rather than the layout.
      for (var last = count - 1; last > 0; last--) {
        var pick = Math.floor(Math.random() * (last + 1));
        var held = order[last]; order[last] = order[pick]; order[pick] = held;
      }

      var step = TILE_SPREAD / Math.max(1, count - 1);
      var painted = new Float32Array(count); // Alpha already on the canvas.
      var head = 0; // First patch that is not opaque yet.
      var tail = 0; // First patch that has not started yet.
      var startedAt = 0;

      function finishProfileSwap() {
        if (transition !== activeProfileTransition) return;
        // The rotation counts from the photo that just settled, not from a
        // fixed cadence, so a picture is always on screen for its full turn.
        scheduleAutoSwitch();
        $profileImg.attr('src', src);
        var ready = $profileImg[0].decode ? $profileImg[0].decode() : Promise.resolve();
        ready.catch(function() {}).then(function() {
          // Only lift the cover once the <img> underneath holds the new photo.
          requestAnimationFrame(function() {
            if (transition === activeProfileTransition && dissolveCanvas === canvas) {
              canvas.parentNode.removeChild(canvas);
              dissolveCanvas = null;
            }
          });
        });
      }

      // One pass over the patches that are mid-fade, rather than a timer each:
      // at this count the gap between two starts is under 2ms, well below what
      // setTimeout can resolve, so the timers would clump into visible steps.
      function paintFrame(now) {
        if (transition !== activeProfileTransition) return;
        if (!startedAt) startedAt = now;
        var elapsed = now - startedAt;
        while (tail < count && tail * step <= elapsed) tail++;
        for (var turn = head; turn < tail; turn++) {
          var was = painted[turn];
          if (was >= 1) continue;
          var target = TILE_FADE > 0
            ? profileEase(Math.min(1, (elapsed - turn * step) / TILE_FADE))
            : 1;
          if (target <= was) continue;
          // Painting alpha a over alpha A leaves A + a(1 - A), so solve for the
          // a that lands on this patch's target and the fade stays true to the
          // easing curve instead of drifting opaque.
          ctx.globalAlpha = target >= 1 ? 1 : (target - was) / (1 - was);
          var tile = order[turn];
          var col = tile % TILE_COLS;
          var row = (tile - col) / TILE_COLS;
          var x = colEdges[col];
          var y = rowEdges[row];
          var w = colEdges[col + 1] - x;
          var h = rowEdges[row + 1] - y;
          if (w > 0 && h > 0) {
            ctx.drawImage(photo,
              (x - originX) / scale, (y - originY) / scale, w / scale, h / scale,
              x, y, w, h);
          }
          painted[turn] = target;
        }
        // Every patch fades for the same length of time, so they finish in the
        // order they started and the head only ever moves forwards.
        while (head < count && painted[head] >= 1) head++;
        if (head < count) {
          dissolveFrame = requestAnimationFrame(paintFrame);
          return;
        }
        dissolveFrame = 0;
        finishProfileSwap();
      }

      dissolveFrame = requestAnimationFrame(paintFrame);
    }

    // The photo also rotates on its own. A manual pick restarts the clock, so
    // the photo somebody just chose is never replaced a moment later.
    var autoSwitchTimer = 0;
    var profileOnScreen = true;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function(entries) {
        profileOnScreen = entries[entries.length - 1].isIntersecting;
      }).observe(profileStage);
    }

    function scheduleAutoSwitch() {
      if (!AUTO_SWITCH) return;
      clearTimeout(autoSwitchTimer);
      autoSwitchTimer = setTimeout(function() {
        // Skip a turn rather than dissolve into a photo nobody is looking at.
        if (document.hidden || !profileOnScreen) {
          scheduleAutoSwitch();
          return;
        }
        var index = $profileBtns.index($profileBtns.filter('.active'));
        var $next = $profileBtns.eq((index + 1) % $profileBtns.length);
        // The clock is restarted by the swap itself, once the photo has landed.
        swapProfilePic($next.data('image'), $next, PROFILE_DURATION);
      }, AUTO_SWITCH);
    }

    $(document).on('visibilitychange', function() {
      if (!document.hidden) scheduleAutoSwitch();
    });

    $profileBtns.on('click', function() {
      swapProfilePic($(this).data('image'), $(this));
      scheduleAutoSwitch();
    });

    scheduleAutoSwitch();
  }

  init();

});
