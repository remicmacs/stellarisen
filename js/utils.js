function deviceIsMobile() { return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1); }

function viewportIsPortrait() { return (window.innerWidth / window.innerHeight) < 1; }

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var utils = {
  get ratio() { return (viewportIsPortrait() ?	window.innerWidth / window.innerHeight : window.innerHeight / window.innerWidth); }
}

function enable(id) {
  let dom = document.getElementById(id);
  dom.classList.remove('disabled');
  dom.classList.add('enabled');
}

function disable(id) {
  let dom = document.getElementById(id);
  dom.classList.remove('enabled');
  dom.classList.add('disabled');
}

function toggle(id) {
  let dom = document.getElementById(id);
  if (dom.classList.contains('enabled')) {
    disable(id);
  }
  else {
    enable(id);
  }
}

function setSpan(id, content) {
  let dom = document.getElementById(id);
  dom.innerHTML = content;
}

function setImgSrc(id, src) {
  let dom = document.getElementById(id);
  dom.src = src;
}
