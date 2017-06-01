;(function (win,doc) {

  var root_element = doc.querySelector('.morph-dropdown');
  var main_nav = root_element.querySelector('.main-nav');
  var main_nav_items = main_nav.querySelectorAll('.has-dropdown');
  var ddl = root_element.querySelector('.dropdown-list');
  var ddl_wrapper = ddl.querySelector('.dropdown');
  var ddl_items = ddl.querySelectorAll('.content');
  var ddl_bg = ddl.querySelector('.bg-layer');
  var mq = checkMq();
  var resizing = false;
  var supports_passive = 'values' in win.Object && !('defaultCharset' in doc) && 'isSecureContext' in win;
  var event_opts = supports_passive ? {passive:true,capture:false} : false;
  var _css_transform =
         'transform' in root_element.style ? 'transform' :
   'webkitTransform' in root_element.style ? 'webkit-transform' :
      'mozTransform' in root_element.style ? 'moz-transform' :
       'msTransform' in root_element.style ? 'ms-transform' :
        'oTransform' in root_element.style ? 'o-transform' : !1;

  var _js_transform =
         'transform' in root_element.style ? 'transform' :
   'webkitTransform' in root_element.style ? 'webkitTransform' :
      'mozTransform' in root_element.style ? 'mozTransform' :
       'msTransform' in root_element.style ? 'msTransform' :
        'oTransform' in root_element.style ? 'oTransform' : !1;

  var _test = _css_transform && (win.getComputedStyle(ddl_bg).getPropertyValue(_css_transform)).charAt(6);
  var _supports = _css_transform && (_test === '3' ? 3 : _test === '(' ? 2 : 0);

  for(var i = 0; i < main_nav_items.length; ++i){
    main_nav_items[i].addEventListener('mouseenter', ddlMouseEnter, event_opts);
    main_nav_items[i].addEventListener('mouseleave', ddlMouseLeave, event_opts);
    main_nav_items[i].addEventListener('touchstart', ddlTouch, event_opts);
  }

  win.addEventListener('resize',switchNavigationTypes,event_opts);

  (doc.body||doc.getElementsByTagName('body')[0]).addEventListener('click', menuClick,event_opts);
  doc.addEventListener('keyup', ddlKeyup,event_opts);
  ddl.addEventListener('mouseleave', ddlMouseLeave,event_opts);

  resetDropdown();

  function checkMq () {
    if('matchMedia' in win) return win.matchMedia('(min-width:768px)').matches;
    return win.getComputedStyle(root_element, '::before').getPropertyValue('content').replace(/'/g,'').replace(/"/g,'').split(', ')[0] === 'desktop';
  }

  function ddlMouseLeave () {
    (main_nav.querySelectorAll('.has-dropdown:hover').length === 0
      && root_element.querySelectorAll('.dropdown-list:hover').length === 0)
        && delay(hideDropdown());
  }

  function ddlTouch (e) {
    var selectedDropdown;
    if (!('ontouchstart' in win)) return;
    selectedDropdown = ddl.querySelector('#' + e.target.data('content'));
    if (!root_element.classList.contains('is-dropdown-visible') || !selectedDropdown.classList.contains('active')) {
      e.preventDefault();
      ddlMouseEnter(e);
    }
  }

  function menuClick (e) {
    if (typeof e === 'undefined') return;

    var evt = (e.target || this);
    var selector = (evt.tagName.toLowerCase());

    if (selector && !(root_element.querySelector(selector))) {
      return ddlMouseLeave();
    }

    if (evt.classList.contains('nav-trigger') || evt.classList.contains('nav-trigger-bar')) {
      typeof e !== 'undefined' && e.preventDefault();
      root_element.classList.toggle('nav-open');
    }
  }

  function ddlKeyup (e) {
    var key = e.key || e.which || e.keyCode;
    if(typeof key === 'undefined') return;
    if (key === 'Tab' || key === 9) {
      if (doc.activeElement.classList.contains('has-dropdown')) {
        return ddlMouseEnter({
          'target': doc.activeElement
        });
      } else if (doc.activeElement.getAttribute('tabindex')) {
        return;
      //} else {
        //return ddlMouseLeave();
      }
    }
  }

  function ddlMouseEnter (e) {
    mq = checkMq();
    if (!mq) return;

    var item = (e.target || this);
    var this_ddl = ddl.querySelector('#'+item.getAttribute('data-content'));
    var this_ddl_height = this_ddl.clientHeight;
    var this_ddl_width = this_ddl.querySelector('.content').clientWidth;
    var this_ddl_height = this_ddl.querySelector('.content').clientHeight;
    var this_ddl_top = item.getBoundingClientRect().top + (item.clientHeight)/2 - this_ddl_height/2;
    var actives = root_element.querySelectorAll('.hovered');

    updateDropdown(this_ddl_height, this_ddl_width, this_ddl_top);

    for (var i = 0; i < actives.length; ++i) actives[i].classList.remove('hovered');
    item.classList.add('hovered');
    this_ddl.classList.add('hovered');
    this_ddl.classList.remove('move-down');
    this_ddl.classList.remove('move-up');
    if (this_ddl.previousElementSibling) this_ddl.previousElementSibling.classList.add('move-down');
    if (this_ddl.nextElementSibling) this_ddl.nextElementSibling.classList.add('move-up');

    if (!root_element.classList.contains('is-dropdown-visible')) {
      win.setTimeout(function() {
        root_element.classList.add('is-dropdown-visible');
      }, 10);
    }
  }

  function updateDropdown (height,width,top) {
    ddl.style.width = width+'px';
    ddl.style.height = height+'px';
    switch (_supports) {
      case 3:
        ddl.style[_js_transform] = 'matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,'+top+',0,1)';
        ddl_bg.style[_js_transform] = 'matrix3d('+width+',0,0.00,0,0.00,'+height+',0.00,0,0,0,1,0,0,0,0,1)';
        break;
      case 2:
        ddl.style[_js_transform] = 'matrix(1,0.00,0.00,1,0,'+top+')';
        ddl_bg.style[_js_transform] = 'matrix('+width+',0.00,0.00,'+height+',0,0)';
        break;
      case 0:
        ddl.style.top = top+'px';
        ddl_bg.style.width = width+'px';
        ddl_bg.style.height = height+'px';
        break;
      default:
        ddl.style[_js_transform] = 'matrix(1,0.00,0.00,1,0,'+top+')';
        ddl_bg.style[_js_transform] = 'matrix('+width+',0.00,0.00,'+height+',0,0)';
    }
  }

  function hideDropdown () {
    mq = checkMq();
    if (!mq) return;
    root_element.classList.remove('is-dropdown-visible');
    var actives = root_element.querySelectorAll('.hovered');
    var move_lefts = root_element.querySelectorAll('.move-down');
    var move_rights = root_element.querySelectorAll('.move-up');
    for (var i = 0; i < actives.length; ++i) actives[i].classList.remove('hovered');
    for (var j = 0; j < move_lefts.length; ++j) move_lefts[j].classList.remove('move-down');
    for (var k = 0; k < move_rights.length; ++k) move_rights[k].classList.remove('move-up');
  }

  function resetDropdown () {
    resizing = false;
    mq = checkMq();
    if (!!mq) return;
    ddl.removeAttribute('style');
  }

  function switchNavigationTypes () {
    if (!!resizing) return;
    resizing = true;
    return rebounce(resetDropdown());
  }

  function rebounce (f) {
    var scheduled, context, args, i;
    return function () {
      context = this; args = []; args.length = arguments.length; i = 0;
      for(; i < arguments.length; ++i) args[i] = arguments[i];
      if (!!scheduled) win.cancelAnimationFrame(scheduled);
      scheduled = win.requestAnimationFrame(function () {
        f.apply(context, args); scheduled = null;
      });
    }
  }

  function delay (f) {
    var scheduled, context, args, i;
    return function () {
      context = this; args = []; args.length = arguments.length; i = 0;
      for (; i < arguments.length; ++i) args[i] = arguments[i];
      if (!!scheduled) win.cancelTimeout(scheduled);
      scheduled = win.setTimeout(function () {
        f.apply(context, args); scheduled = null;
      },50);
    }
  }

})(window, window.document);
