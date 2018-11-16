/**
 * @file Utilities functions for the Stellar'ISEN app. Functions added to global
 * scope
 */

/**
 * Function to check if device is mobile
 */
function deviceIsMobile() {
  return (
    typeof window.orientation !== "undefined")
    || (navigator.userAgent.indexOf('IEMobile') !== -1
  );
}

/**
 * Return whether device is displaying in portrait or landscape
 */
function viewportIsPortrait() {
  return (window.innerWidth / window.innerHeight) < 1;
}

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/**
 * Setting a property `ratio` in a global constant `utils`
 */
const utils = {
  get ratio() {
    return (
      viewportIsPortrait() ?
      window.innerWidth / window.innerHeight :
      window.innerHeight / window.innerWidth
    );
  }
}

function stopPropagation(event) {
  event.stopPropagation();
}

/**
 * Helper function to enable a HTML element
 * @param {string} id The HTML id of the element
 */
function enable(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('disabled');
    element.classList.add('enabled');
  }
}

/**
 * Helper function to disable a HTML element
 * @param {string} id The HTML id of the element
 */
function disable(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('enabled');
    element.classList.add('disabled');
  }
}

/**
 * Helper function to toggle a HTML element
 * @param {string} id The HTML id of the element
 */
function toggle(id) {
  const element = document.getElementById(id);
  if (element.classList.contains('toggle')) {
    if (element.classList.contains('on')) {
      unselect(id);
    } else {
      select(id);
    }
  }
  else if (element.classList.contains('enabled')) {
    disable(id);
  } else {
    enable(id);
  }
}

/**
 * Helper function to select a toggle
 * @param {string} id The HTML id of the element
 */
function select(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('off');
    element.classList.add('on');
  }
}

/**
 * Helper function to unselect a toggle
 * @param {string} id The HTML id of the element
 */
function unselect(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('on');
    element.classList.add('off');
  }
}

function setSpan(id, content) {
  const element = document.getElementById(id);
  element.innerHTML = content;
}

function setImgSrc(id, src) {
  const element = document.getElementById(id);
  element.src = src;
}

/**
 * Helper function to show a hidden HTML element
 * @param {string} id The HTML id of the element
 */
function show(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('hidden');
    element.classList.add('visible');
  }
}

/**
 * Helper function to hide a showed HTML element
 * @param {string} id The HTML id of the element
 */
function hide(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('visible');
    element.classList.add('hidden');
  }
}

function isHidden(id) {
  const element = document.getElementById(id);
  if (element != null) {
    return element.classList.contains("hidden");
  }
}

function isVisible(id) {
  const element = document.getElementById(id);
  if (element != null) {
    return element.classList.contains("visible");
  }
}

function setPlaceholder(id, content) {
  const element = document.getElementById(id);
  if (element != null) {
    element.placeholder = content;
  }
}

/**
 * Helper function to show the modal panel in the center
 */
function showCenterModal() {
  enable('infos-wrapper');
  enable('infos');
}

/**
 * Helper function to hide the modal panel in the center
 */
function hideCenterModal() {
  disable('infos');
  disable('infos-wrapper');

  hide('star-panel');
  hide('constellation-panel');
}

function showLeftModal() {
  enable('menu');
  //hide('login-panel');
  //hide('register-panel');
}

function hideLeftModal() {
  disable('menu');

  hide('menu-panel');
  hide('login-panel');
  hide('register-panel');
}

function showRightModal() {
  enable('planet-infos');
  enable('planet-infos-wrapper');
}

function hideRightModal() {
  disable('planet-infos');
  disable('planet-infos-wrapper');

  hide('planet-panel');
  hide('moon-panel');
}

function showLogin() {
  hide('menu-panel');
  show('login-panel');
  hide('register-panel');

  showLeftModal();
}

function showRegister() {
  hide('menu-panel');
  hide('login-panel');
  show('register-panel');

  showLeftModal();
}

function showMenu() {
  show('menu-panel');
  hide('login-panel');
  hide('register-panel');

  showLeftModal();
}

function showPlanet() {
  show('planet-panel');
  hide('moon-panel');

  showRightModal();
}

function showMoon() {
  show('moon-panel');
  hide('planet-panel');

  showRightModal();
}

function setLeft(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('right');
    element.classList.remove('left');
    element.classList.remove('top');
    element.classList.remove('bottom');
    element.classList.add('left');
  }
}

function setTop(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('right');
    element.classList.remove('left');
    element.classList.remove('top');
    element.classList.remove('bottom');
    element.classList.add('top');
  }
}

function setRight(id) {
  const element = document.getElementById(id);
  if (element != null) {
    element.classList.remove('right');
    element.classList.remove('left');
    element.classList.remove('top');
    element.classList.remove('bottom');
    element.classList.add('right');
  }
}
