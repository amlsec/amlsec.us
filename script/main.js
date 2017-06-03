;(function (win, doc) {
  'use strict';
  var animating  = false;
  var root_el    = doc.documentElement || doc.getElementsByTagName('html')[0];
  var head_el    = doc.head || doc.getElementsByTagName('head')[0];
  var body_el    = doc.body || doc.getElementsByTagName('body')[0];
  var header     = doc.getElementsByTagName('header')[0];
  var hgroup     = doc.querySelector('.hgroup');
  //var overlay    = doc.querySelector('.header-overlay');
  var main       = doc.getElementById('main');
  var menu       = doc.getElementsByTagName('aside')[0];
  var w          = (win.innerWidth || root_el.clientWidth || body_el.clientWidth);
  var h          = (win.innerHeight || root_el.clientHeight || body_el.clientHeight);
  var vid_el     = doc.querySelector('.video-container');
  var _btn_send  = doc.getElementById('send_form');
  var _transform = 'transform' in root_el.style ? 'transform' :
             'webkitTransform' in root_el.style ? 'webkitTransform' :
                'mozTransform' in root_el.style ? 'mozTransform' :
                 'msTransform' in root_el.style ? 'msTransform' :
                  'oTransform' in root_el.style ? 'oTransform' : 'transform';
  var _supports_video = 'HTMLVideoElement' in win;
  var _spinner;
  
  init();
  
  function init () {
    win.requestAnimationFrame(findActiveNavLink);
    win.addEventListener('scroll', eventDispatch, { passive: true,  capture: false, once: false });
    win.addEventListener('load',   eventDispatch, { passive: true,  capture: false, once: true  });
    win.addEventListener('blur',   eventDispatch, { passive: true,  capture: true,  once: false });
    win.addEventListener('click',  eventDispatch, { passive: false, capture: false, once: false });
    win.addEventListener('submit', eventDispatch, { passive: false, capture: false, once: false });
  }
  
  function getVideo () {
    var _src_urls = [];
    if (!win.connection.slow) {
      _src_urls = {
        webm : 'https://amlsec.us/vid/intro.webm',
        mp4 : 'https://amlsec.us/vid/intro.mp4'
      };
    } else {
      _src_urls = {
        webm : 'https://amlsec.us/vid/intro2.webm',
        mp4 : 'https://amlsec.us/vid/intro2.mp4'
      };
    }
    vid_el.removeChild(vid_el.querySelector('img'));
    vid_el.removeAttribute('data-before-init');
    if (!!_supports_video) {
      return '<video preload="auto" autoplay="autoplay" poster="https://amlsec.us/img/maxresdefault.jpg" webkit-playsinline="webkit-playsinline" playslinline="playslinline"><source src="'+_src_urls.mp4+'" type="video/mp4" /></video>';
    }
    return '<iframe src="https://youtube.com/embed/2lPOFcBti5Y" sandbox="allow-scripts allow-same-origin" frameborder="no" scrolling="no" allowfullscreen="allowFullscreen" allowtransparency="true"></iframe>';
  }
  
  function eventDispatch (e) {
    var evt = e.target || null;
    var typ = e.type || null;
    switch (true) {
      case !(e):
      case !(typ):
      case !(evt):
      case !(typeof evt === 'object'):
      case !(typeof typ === 'string'):
        return;
    }
    switch (typ) {
      case 'scroll':
        return rebounce(findActiveNavLink());
      case 'click':
        if (!('tagName' in evt)) { return; }
        switch (true) {
          case !!(evt.getAttribute('data-scroll-nav')):
            e.preventDefault();
            return smoothScroll(doc.getElementById(evt.getAttribute('data-scroll-section')));
          case !!(evt.parentNode.getAttribute('data-scroll-nav')):
            e.preventDefault();
            return smoothScroll(doc.getElementById(evt.parentNode.getAttribute('data-scroll-section')));
          case !!(evt === vid_el && !vid_el.querySelector('video,iframe')):
            vid_el.insertAdjacentHTML('afterBegin',getVideo());
            break;
          case !!(evt.tagName.toLowerCase() === 'video'):
            !evt.paused ? evt.pause() : evt.play();
            break;
        }
        break;
      case 'blur':
        if (!('tagName' in evt)) { return; }
        switch (evt.tagName.toLowerCase()) {
          case 'input':
          case 'textarea':
            evt.classList.add('afterblur');
            break;
        }
        break;
      case 'submit':
        if (!('id' in evt)) { return false; }
        switch (evt.id.toLowerCase()) {
          case 'contactform':
            return sendContactForm(e, evt);
        }
        break;
      case 'load':
        return handleLoad();
    }
  }
  
  function sendContactForm(e, evt) {
    var _xhr = new win.XMLHttpRequest();
    if (!('withCredentials' in _xhr)) {
      return;
    }
    e.preventDefault();
    var fields = [].slice.call(evt.querySelectorAll('[name]'));
    var j = 0;
    var _data;
    for (; j < fields.length; ++j) {
      if (fields[j].getAttribute('type')!=='hidden'&&!fields[j].getAttribute('hidden')&&!fields[j].value) {
        fields[j].focus();
        return;
      }
    }
    _data = '{' + (fields.map(function (el) {
      return '"' + el.name + '": "' + el.value + '"';
    }).join(',')) + '}';
    _xhr.open(evt.method, evt.action, true);
    _xhr.setRequestHeader('Accept', 'application/json');
    _xhr.setRequestHeader('Content-Type', 'application/json');
    _btn_send.textContent = '.';
    _btn_send.setAttribute('disabled', 'disabled');
    triggerSpinner();
    _xhr.onload = function () {
      win.clearTimeout(_spinner);
      _spinner = null;
      _btn_send.textContent = 'Thank you, ' + (win.JSON.parse(_data).gname) + '!';
      win.setTimeout(function () {
        _btn_send.textContent = 'Confirm details & submit';
        _btn_send.removeAttribute('disabled');
      }, 4800);
    };
    _xhr.onerror = _xhr.ontimeout = _xhr.onabort = function () {
      win.clearTimeout(_spinner);
      _spinner = null;
      _btn_send.textContent = 'Sorry, something went wrong.';
      win.setTimeout(function () {
        _btn_send.textContent = 'Confirm details & submit';
        _btn_send.removeAttribute('disabled');
      }, 4800);
    };
    _xhr.send(_data);
    return false;
  }
  
  function triggerSpinner () {
    _spinner = win.setTimeout(function () {
      if (_btn_send.textContent.length < 9) {
        _btn_send.textContent += '.';
      } else {
        _btn_send.textContent = '.';
      }
      return triggerSpinner();
    }, 300);
  }
  
  function handleLoad () {
    root_el.setAttribute('data-fonts-loaded', 'true');
    win.clearTimeout(win.connection.timer);
    if (!win.connection.slow) {
      root_el.setAttribute('data-slow-connection', 'false');
      doc.head.insertAdjacentHTML('beforeEnd', '<link rel="apple-touch-icon-precomposed" sizes="120x120" href="/apple-touch-icon-120x120.png" /><link rel="apple-touch-icon-precomposed" sizes="76x76" href="/apple-touch-icon-76x76.png" /><link rel="apple-touch-icon-precomposed" sizes="60x60" href="/apple-touch-icon-60x60.png" /><link rel="icon" type="image/x-icon" href="/favicon.ico" />');
    }
    if (w >= 768) {
      menu.setAttribute('aria-hidden', 'false');
      menu.setAttribute('role', 'menubar');
    }
    if ('euc' in win){
      win.euc.init({
        alertParentSelector: 'main',
        alertContent: 'This website uses cookies. <button class="cta-button secondary text-inherit">Okay</button>'
      });
    }
    if ('stabs' in win){
      win.stabs.init();
    }
    [].slice.call(doc.querySelectorAll('img[data-src]')).forEach(function(img){img.src=img.getAttribute('data-src')});
    /*
    if ('serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js')
      .then(function(registration){
        console.info('SW registered [' + registration.scope + ']');
      })
      .catch(function(err){
        console.warn('SW failed to register [' + err + ']');
      });
    }
    */
    if (!!win.location.hash && !!(doc.getElementById(win.location.hash.replace('#','')))) {
      win.setTimeout(function () {
        smoothScroll(doc.getElementById(win.location.hash.replace('#','')));
      }, 1500);
    }
    ga('create', 'UA-90341485-1', 'auto');
    ga('send', 'pageview');
  }
  
  function rebounce (f) {
    var scheduled, context, args, i;
    return function () {
      context = this; args = []; i = 0;
      for (;i < arguments.length; ++i) args[i] = arguments[i];
      if (!!scheduled) win.cancelAnimationFrame(scheduled);
      scheduled = win.requestAnimationFrame(function () {
        f.apply(context, args); scheduled = null;
      });
    }
  }
  
  function setActiveNavLink (section) {
    var lnks = doc.getElementById('nav').getElementsByTagName('a');
    var m = 0;
    for (; m < lnks.length; ++m) {
      if (section.id === lnks[m].getAttribute('data-scroll-section')) {
        lnks[m].classList.add('active');
      } else {
        lnks[m].classList.remove("active");
      }
    }
  }
  
  function findActiveNavLink () {
    var oY = (win.scrollY || win.pageYOffset);
    var oD = ((h - oY) / h);
    var sections = doc.querySelectorAll('main>header,main>section');
    var t = 0;
    for (; t < sections.length; ++t) {
      var r = sections[t].getBoundingClientRect();
      if (r.top < (h / 2) && r.top >= 0) {
        setActiveNavLink(sections[t]);
      }
    }
    //overlay.style[_transform] = 'translateY(' + oD * 10 + 'vh)';
    if (oD <= 0) {
      hgroup.style.opacity = 0;
      return;
    }
    if (oD >= 0 && oD <= 1) {
      hgroup.style.opacity = oD;
      hgroup.style[_transform] = 'translateY(' + (-100 + (oD * 50)) + '%)';
    }
  }
  
  function getPos (_t,_st,_f,_sf) {
    var d;
    if (_sf > _t) {
      return _f;
    }
    d = (_sf / _t);
    return _st + (_f - _st) * (d < 0.5 ? 4*d*d*d : (d-1)*(2*d-2)*(2*d-2)+1);
  }
  
  function getTime () {
    return ('performance' in win) ? win.performance.now() : new Date().getTime();
  }
  
  function smoothScroll (el) {
    var _t = 400;
    var _st = win.scrollY || win.pageYOffset;
    var _f = (el.tagName.toLowerCase() !== 'html') ? el.getBoundingClientRect().top + _st : -_st;
    var _ct = getTime();
    var step = function () {
      var _sf = getTime()-_ct;
      win.scroll(0, getPos(_t,_st,_f,_sf));
      if (_sf > _t) {
        if (win.location.hash !== ('#' + el.id)) {
          win.location.replace('#' + el.id);
        }
        win.requestAnimationFrame(function () {
          animating = false;
        });
      } else {
        win.requestAnimationFrame(step);
      }
    };
    animating = true;
    return step();
  }
})(window, window.document);

;(function (win, doc) {
  'use strict';
  if (!('HTMLCanvasElement' in win)) { return; }
  var FPS = 24;
  var frm = 0;
  var _video = doc.createElement('video');
  _video.crossOrigin = 'anonymous';
  _video.autoplay = 'autoplay';
  _video.loop = 'loop';
  _video.muted = 'muted';
  _video.src = 'https://www.amlsec.us/vid/amlsecintro.mp4';
  _video.type = 'video/mp4';
  var _canvas = doc.createElement('canvas');
  _canvas.width = 640;
  _canvas.height = 360;
  doc.body.insertBefore(_canvas,doc.body.firstChild);
  _video.addEventListener('loadeddata', sync, {passive:true,capture:false,once:false});
  function glitchVid (canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
  }
  glitchVid.prototype.drawImage = function(img, x, y) {
    this.canvas.getContext("2d").drawImage(img, x, y);
  };
  glitchVid.prototype.glitchWave = function(renderLineHeight, cuttingHeight){
    var image = this.ctx.getImageData(0, renderLineHeight, this.width, cuttingHeight);
    this.ctx.putImageData(image, 0, renderLineHeight - 10);
  };
  glitchVid.prototype.glitchSlip = function(waveStrength, startHeight, endHeight){
    var temp;
    if (endHeight < startHeight) {
      temp = endHeight;
      endHeight = startHeight;
      startHeight = temp;
    }
    for (var h = startHeight; h < endHeight; h++) {
      var image;
      if (win.Math.random() < 0.1) { h++; }
      image = this.ctx.getImageData(0, h, this.width, 1);
      this.ctx.putImageData(image, win.Math.random() * waveStrength - (waveStrength / 2), h);
    }
  };
  glitchVid.prototype.glitchFillRandom = function (fillCnt, cuttingMaxHeight) {
    var cw = this.width;
    var ch = this.height;
    var i, image, rndX, rndY, rndW, rndH;
    i = image = rndX = rndY = rndW = rndH = 0;
    for (; i < fillCnt; i++) {
      rndX = (cw * win.Math.random() << 0) + 1;
      rndY = (ch * win.Math.random() << 0) + 1;
      rndW = (cw * win.Math.random() << 0) + 1;
      rndH = (cuttingMaxHeight * win.Math.random() << 0) + 1;
      image = this.ctx.getImageData(rndX, rndY, rndW, rndH);
      this.ctx.putImageData(image, (rndX * win.Math.random()) % cw, rndY);
    }
  };
  glitchVid.prototype.process = function () {};
  function glitch () {
    var _glitchVid = new glitchVid(_canvas);
    frm++;
    _glitchVid.drawImage(_video, 0, 0);
    // _glitchVid.glitchWave((frm * 3) % glitch.height, 10);
    if (frm % 100 < 10) { _glitchVid.glitchFillRandom(5, 20); }
    if (80 < frm % 100) { _glitchVid.glitchSlip(10, 200, 300); }
    if (95 < frm % 100) { _glitchVid.glitchSlip(10, 100 * win.Math.random(), 400 * win.Math.random()); }
    sync();
  }
  function sync () {
    win.setTimeout(glitch, 1000/FPS);
  }
})(window, window.document);
