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
    $('a[href^="#"]').on('click', smoothScroll)

    buildSnippets();
    buildTOC();
    initDarkMode();
  }

  function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
      $body.addClass('dark-mode');
      $('#dark-mode-toggle i').removeClass('fa-moon-o').addClass('fa-sun-o');
    }

    $('#dark-mode-toggle').on('click', function(e) {
      e.preventDefault();
      $body.toggleClass('dark-mode');
      var isDark = $body.hasClass('dark-mode');
      localStorage.setItem('darkMode', isDark);
      $(this).find('i').toggleClass('fa-moon-o fa-sun-o');
    });
  }

  function smoothScroll(e) {
    e.preventDefault();
    $(document).off("scroll");
    var target = this.hash,
        menu = target;
    $target = $(target);
    $('html, body').stop().animate({
        'scrollTop': $target.offset().top-40
    }, 0, 'swing', function () {
        window.location.hash = target;
        $(document).on("scroll", onScroll);
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
    var $sections = $('.docs-section');
    
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
    $window.on('scroll', function() {
      var scrollTop = $window.scrollTop();
      var windowHeight = $window.height();

      // Subtle vertical shift based on scroll direction
      var delta = scrollTop - lastScrollTop;
      var shift = Math.max(-8, Math.min(8, delta * 0.3));
      var $toc = $('#floating-toc');
      $toc.css('transform', 'translateY(calc(-50% + ' + shift + 'px))');

      // Highlight active section
      var currentId = '';
      $sections.each(function() {
        var sectionTop = $(this).offset().top - 100;
        if (scrollTop >= sectionTop) {
          currentId = $(this).attr('id');
        }
      });

      $toc.find('a').removeClass('active');
      if (currentId) {
        $toc.find('a[href="#' + currentId + '"]').addClass('active');
      }

      lastScrollTop = scrollTop;
    });
  }


  // Handle links that open a side project modal (e.g. #side-project-amd)
  $(document).on('click', 'a[href^="#side-project-"]', function(e) {
    e.preventDefault();
    var slug = $(this).attr('href').replace('#side-project-', '').toLowerCase();
    var $card = $('.side-project-card').filter(function() {
      return $(this).data('project-title').toLowerCase() === slug;
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

  // Hobbies toggle
  $('#hobbies-toggle').on('click', function(e) {
    e.preventDefault();
    $('#hobbies-content').slideToggle(300);
    $('#hobbies-hint').fadeToggle(300);
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

  init();

});