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

/* Trouvée ici : https://stackoverflow.com/a/9609450 */
var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();
