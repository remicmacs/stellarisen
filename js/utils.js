function deviceIsMobile() { return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1); }

function viewportIsPortrait() { return (window.innerWidth / window.innerHeight) < 1; }

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var utils = {
  get ratio() { return (viewportIsPortrait() ?	window.innerWidth / window.innerHeight : window.innerHeight / window.innerWidth); }
}
