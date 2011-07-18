
// iScroll

var mainScroll; // global
var sideScroll; // global

var LFW = {};


LFW.sideScrollRefresh = function() {
  if (sideScroll) {
    sideScroll.refresh(); // Adjust scroller for new elements and fonts loading
    console.log('scroll refresh');
  }
};

LFW.mainScrollRefresh = function() {
  if (mainScroll) {
    mainScroll.refresh(); // Adjust scroller for new elements and fonts loading
    console.log('scroll refresh');
  }
};

LFW.linkify = function() {
  // Replace all simple #anchor links with JavaScript links.
  // Hack around hashtags breaking iScroll. This is supposed to be fixed in iScroll 4.2.
  
  var nav_links = $('#side a');
  
  for (var i = 0; i < nav_links.length; i++) {
    // Find links with in-page hashes
    
    var link = nav_links[i];
    var url = link.href.split('#');
    var linkPage = url[0];
    var hash = url[1];
    
    var currentPage = document.location.toString().split('#')[0];
    var linkIsInPage = (linkPage == currentPage);
    
    if (linkIsInPage && hash) {
      link.LFWhash = hash; // store for jumping later
      
      link.onclick = function(e) {
        LFW.jumpTo(this.LFWhash);
        return false;
      };
    }
  }
};


LFW.scrollEnd = function() {
  // A scroll on the main content ended.
  
  var markers = $('a[name^="lfw_"]'); // All section anchors, form "lfw_XXX"
  var currentTop = mainScroll.y - 20;

  var currentSectionMarker;
  
  markers.each(function(i, marker) {
    var markerTop = mainScroll._offset(marker).top;
    
    if (markerTop > currentTop) {
      // Best marker found so far
      currentSectionMarker = marker;
    } // Once it starts finding markers past the current position, it stops recording them
    
  });
  
  if (!currentSectionMarker) {
    console.log("No section marker found.");
    return;
  }
  
  var sectionName = currentSectionMarker.name;
  sectionName = sectionName.substring("lfw_".length); // Strip off lfw_
  
  sectionLink = $('a[href$=#' + sectionName + ']'); // hrefs that link to #name for the found anchor
  $('a.current').removeClass('current');
  sectionLink.addClass('current');
};

LFW.loaded = function() {
    // Page setup.
    
    LFW.linkify();
  
    document.addEventListener('touchmove', function(e){ e.preventDefault(); }, false);

    mainScroll = new iScroll('main', {'onScrollEnd': LFW.scrollEnd});
    var currentHash = document.location.toString().split('#')[1];
    LFW.jumpTo(currentHash, true);
    
    sideScroll = new iScroll('side');
    console.log('scroll create');

    $("dd").hide(); // Close all the nav lists
    $("dt.open").next().show(); // Open the nav list that should be open

    var openElement = $("dt.open")[0];
    if (openElement) {
      sideScroll.scrollToElement(openElement, 0); // Scroll to the nav list
      sideScroll.scrollTo(0, -80, 0, true); // Scroll backwards a bit so the element isn't right at the top
    }
    
    $("dt a").click(function() {
      // On click, open this subnav.
      
      var visible = $("#navigation dd:visible")[0];
      var child = $(this).parent().next()[0];
      
      $(visible).slideUp("slow", LFW.sideScrollRefresh); // Close whatever is open
      
      if (visible != child) {
        $(child).slideDown("slow", LFW.sideScrollRefresh);
      }

      $('.open').removeClass('open'); // Close last opened flag
      $(this).parent().addClass('open'); // Apply open style

      LFW.sideScrollRefresh();

      return false ;
    });
    
    $('.example2').hide();
    $('#logo').click(function() {
      $('#top').slideToggle(800);
      return false;
    });

    LFW.sideScrollRefresh();
    
    /* This is a hack to get the scrolling heights to refresh as new content renders. */
    setTimeout(LFW.sideScrollRefresh, 500);
    setTimeout(LFW.mainScrollRefresh, 500);
    setTimeout(LFW.sideScrollRefresh, 5000);
    setTimeout(LFW.mainScrollRefresh, 5000);
};

LFW.jumpTo = function(anchor, instant) {
  // Jump the main content to a destination anchor, prepending lfw_ so the hash marks don't confuse iscroll
  
  var time = instant ? 0 : 500;
  anchor = 'lfw_' + anchor;
  
  if (mainScroll) {
    var element = $('a[name=' + anchor + ']')[0];
    if (element) {
      mainScroll.scrollToElement(element, time);
    } else {
      console.error("No <a> found with name=", anchor);
    }
  } else {
    console.error("Navigation called before content has loaded.");
  }
};

LFW.lightbox = function(url) {
  var box = '<div id="lightbox"><img class="close" src="images/x1.png"/>'
    +'<div id="content"><iframe scrolling="no" src="'+ url +'"></iframe></div>'
    +'</div>';
  
  $('body').append(box);
  $('#lightbox .close').click(function() {
    LFW.closeLightbox();
  });
};

LFW.closeLightbox = function() {
  $('#lightbox').remove();
};

document.addEventListener('DOMContentLoaded', LFW.loaded, false);
