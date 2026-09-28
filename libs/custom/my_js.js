$(document).ready(function() {

  // Variables
  var $codeSnippets = $('.code-example-body'),
      $nav = $('.navbar'),
      $body = $('body'),
      $window = $(window),
      $popoverLink = $('[data-popover]'),
      navOffsetTop = $nav.offset().top,
      $document = $(document),
      entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      }

  function init() {
    $window.on('scroll', onScroll)
    $window.on('resize', resize)
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
    $('a[href^="#"], .navbar-link').on('click', smoothScroll)

    buildSnippets();
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

  function openPopover(e) {
    e.preventDefault()
    closePopover();
    var popover = $($(this).data('popover'));
    popover.toggleClass('open')
    e.stopImmediatePropagation();
  }

  function closePopover(e) {
    if($('.popover.open').length > 0) {
      $('.popover').removeClass('open')
    }
  }

  $("#button").click(function() {
    $('html, body').animate({
        scrollTop: $("#elementtoScrollToID").offset().top
    }, 2000);
});

  function resize() {
    $body.removeClass('has-docked-nav')
    navOffsetTop = $nav.offset().top
    onScroll()
  }

  function onScroll() {
    if(navOffsetTop < $window.scrollTop() && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav')
    }
    if(navOffsetTop > $window.scrollTop() && $body.hasClass('has-docked-nav')) {
      $body.removeClass('has-docked-nav')
    }
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function buildSnippets() {
    $codeSnippets.each(function() {
      var newContent = escapeHtml($(this).html())
      $(this).html(newContent)
    })

  }

  function buildTOC() {
    var toc = $('<div id="floating-toc"><h5>Contents</h5><ul></ul></div>');
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
      $sections.each(function() {
        // Use the same reachable position as a TOC click. Short final sections
        // cannot always reach the top of the viewport, especially when folded.
        var sectionTop = sectionScrollTop(this);
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


  // Handle links that open a side project modal (e.g. #side-project-amd)
  $(document).on('click', 'a[href^="#side-project-"]', function(e) {
    e.preventDefault();
    var slug = $(this).attr('href').replace('#side-project-', '').toLowerCase();
    var $card = $('.side-project-card').filter(function() {
      return $(this).data('project-slug') === slug;
    });
    if ($card.length) {
      var index = $card.data('project-index');
      $('html, body').animate({
        scrollTop: $('#side-projects').offset().top - 40
      }, 400, function() {
        $('#side-project-modal-' + index).addClass('open');
        $('body').css('overflow', 'hidden');
      });
    }
  });

  // Side project modals
  $('.side-project-card').on('click', function(e) {
    // Don't open modal if clicking the GitHub link
    if ($(e.target).closest('.side-project-github-link').length) return;
    var index = $(this).data('project-index');
    $('#side-project-modal-' + index).addClass('open');
    $('body').css('overflow', 'hidden');
  });

  $('.side-project-modal-backdrop, .side-project-modal-close').on('click', function() {
    $(this).closest('.side-project-modal').removeClass('open');
    $('body').css('overflow', '');
  });

  $(document).on('keydown', function(e) {
    if (e.key === 'Escape') {
      $('.side-project-modal.open').removeClass('open');
      $('body').css('overflow', '');
    }
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
    // Interrupt from the current height instead of queuing extra toggles.
    $('#hobbies-content').stop(true, false).slideToggle(reducedMotion ? 0 : 550, 'swing');
    $('#hobbies-hint').stop(true, false)
      .attr('aria-hidden', String(expanded))
      .fadeTo(reducedMotion ? 0 : 180, expanded ? 0 : 1);
  });

  // Photo lightbox
  var photoItems = [];
  var currentPhotoIndex = 0;

  $('.photo-item').each(function() {
    photoItems.push({
      src: $(this).find('img').attr('src'),
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
    $lb.find('.photo-lightbox-content img').attr('src', photo.src);
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
    $lb.addClass('open');
    $('body').css('overflow', 'hidden');
  }

  $('.photo-item').on('click', function() {
    showPhoto($(this).data('photo-index'));
  });

  $('.photo-lightbox-close, .photo-lightbox-backdrop').on('click', function() {
    $('#photo-lightbox').removeClass('open');
    $('body').css('overflow', '');
  });

  $('.photo-lightbox-prev').on('click', function(e) {
    e.stopPropagation();
    showPhoto(currentPhotoIndex - 1);
  });

  $('.photo-lightbox-next').on('click', function(e) {
    e.stopPropagation();
    showPhoto(currentPhotoIndex + 1);
  });

  $(document).on('keydown', function(e) {
    if (!$('#photo-lightbox').hasClass('open')) return;
    if (e.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
    if (e.key === 'Escape') {
      $('#photo-lightbox').removeClass('open');
      $('body').css('overflow', '');
    }
  });

  // Profile picture switcher
  //
  // Clicking an icon dissolves the new photo in patch by patch. Each patch is a
  // window onto its own copy of the incoming image, sized to the whole frame and
  // shifted into place, so all of them share the base image's object-fit crop.
  // The patches light up in a shuffled order rather than sweeping a direction,
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
    // Use the same YAML timing for both the stagger and the CSS fade.
    var TILE_SPREAD = PROFILE_DURATION - TILE_FADE;
    profileStage.style.setProperty('--profile-tile-fade', TILE_FADE + 'ms');
    profileStage.style.setProperty('--profile-tile-easing', profileTransition.easing);
    var profileRequest = 0;
    var activeProfileTransition = 0;
    var decodedPhotos = Object.create(null);
    var currentProfileSrc = $profileImg.attr('src');

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

    function setActiveProfileBtn($btn) {
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
        ], { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' });
      });
    }

    function swapProfilePic(src, $btn) {
      if (currentProfileSrc === src) return;
      currentProfileSrc = src;
      var request = ++profileRequest;
      prepareProfilePhoto(src).then(function(photo) {
        if (request !== profileRequest) return;
        if (!photo) {
          currentProfileSrc = $profileBtns.filter('.active').data('image');
          return;
        }
        beginProfileSwap(src, $btn);
      });
    }

    function beginProfileSwap(src, $btn) {
      var transition = ++activeProfileTransition;
      setActiveProfileBtn($btn);

      if (reduceMotion) {
        $profileImg.attr('src', src);
        $(profileStage).find('.profile-tile').remove();
        return;
      }

      var w = $(profileStage).width();
      var h = $(profileStage).height();
      var tileW = w / TILE_COLS;
      var tileH = h / TILE_ROWS;
      var tiles = [];
      var fragment = document.createDocumentFragment();

      for (var row = 0; row < TILE_ROWS; row++) {
        for (var col = 0; col < TILE_COLS; col++) {
          var $tile = $('<div class="profile-tile"></div>').css({
            left: col * tileW + 'px',
            top: row * tileH + 'px',
            width: tileW + 'px',
            height: tileH + 'px'
          });
          $('<img>').attr('src', src).css({
            width: w + 'px',
            height: h + 'px',
            left: -col * tileW + 'px',
            top: -row * tileH + 'px'
          }).appendTo($tile);

          tiles.push($tile[0]);
          fragment.appendChild($tile[0]);
        }
      }
      profileStage.appendChild(fragment);

      // Fisher-Yates: the patches are laid out in reading order but have to come
      // up in a scattered one, so shuffle the turn order rather than the layout.
      var order = tiles.map(function(_, i) { return i; });
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }

      // The stagger is a transition-delay per patch rather than a timer per
      // patch: at this count the gap is under 2ms, well below what setTimeout
      // can resolve, so hundreds of timers would clump into visible steps.
      var step = TILE_SPREAD / Math.max(1, order.length - 1);
      order.forEach(function(tileIndex, turn) {
        tiles[tileIndex].style.transitionDelay = (turn * step).toFixed(2) + 'ms';
      });

      // Wait for every patch's real completion. A wall-clock timer can run ahead
      // of painting on busy devices and expose unfinished patches at the end.
      var remaining = tiles.length;
      function finishProfileSwap() {
        if (transition !== activeProfileTransition) return;
        $profileImg.attr('src', src);
        var ready = $profileImg[0].decode ? $profileImg[0].decode() : Promise.resolve();
        ready.then(function() {
          requestAnimationFrame(function() {
            if (transition === activeProfileTransition) {
              $(profileStage).find('.profile-tile').remove();
            }
          });
        }).catch(function() {
          // Keep the fully visible patches covering the frame if decoding fails.
        });
      }
      tiles.forEach(function(tile) {
        if (TILE_FADE === 0 && parseFloat(tile.style.transitionDelay) === 0) {
          remaining--;
          return;
        }
        function onPatchEnd(event) {
          if (event.target !== tile || event.propertyName !== 'opacity') return;
          tile.removeEventListener('transitionend', onPatchEnd);
          if (--remaining === 0) finishProfileSwap();
        }
        tile.addEventListener('transitionend', onPatchEnd);
      });

      // Read a layout property so the browser commits opacity:0 before the class
      // lands - without this the tiles jump straight to opaque, no transition.
      void profileStage.offsetHeight;

      tiles.forEach(function(t) { t.classList.add('show'); });

      // Zero-duration settings have no transitionend event to wait for.
      if (remaining === 0) finishProfileSwap();
    }

    $profileBtns.on('click', function() {
      swapProfilePic($(this).data('image'), $(this));
    });
  }

  init();

});
