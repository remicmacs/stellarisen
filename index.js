//var noSleep = new NoSleep();
//noSleep.enable();

// Init session data
sessionStorage.setItem("isAuthenticated", "false");
sessionStorage.setItem("username", "");

fetch("./about.html", { method: "GET" })
  .then((res) => { return res.text(); })
  .then((res) => { document.getElementById('about-panel').innerHTML = res; });

console.log("Loading init script");

// Building scenes
const skyScene = new THREE.Scene();
skyScene.background = new THREE.Color(0x001b44);
const planetsScene = new THREE.Scene();
planetsScene.background = new THREE.Color(0x000d21);
let camera = null;

let scene = null;

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

const skySphere = new SkySphere(skyScene, renderer, onLoad);
const planets = new Planets(planetsScene, renderer, onLoad);

let sceneUpdate = null;
let home = true;

let previousHash = null;

// Adding renderer to webpage
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
console.log("Renderer added to webpage");

// Attaching routing function
window.onhashchange = () => {
  updateHash(false);
};

if (deviceIsMobile()) {
  show("set-orien");
}

// General events handling (movement controls)
document.addEventListener('mousemove', onMove);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('touchmove', onTouchMove);
document.addEventListener('touchstart', onTouchStart);
document.addEventListener('touchend', onTouchEnd);

// Adding form submit event listeners
const toaster = new Toaster();
const connectionHandler = new ConnectionHandler(toaster);
const registrationHandler = new RegistrationHandler(toaster);
document.connect.onsubmit = (event) => connectionHandler.handle(event);
document.register.onsubmit = (event) => registrationHandler.handle(event);

// Adding favorites panel controller
const favorites = new Favorites(toaster);

// Specific events handling
const events = [
  ['userImage', 'mouseup', openMenu],
  ['userImage', 'touchend', openMenu],
  ['userImage', 'mousedown', stopPropagation],
  ['userImage', 'touchstart', stopPropagation],
  ['close-left', 'mouseup', closeMenu],
  ['close-left', 'touchend', closeMenu],
  ['close-left', 'mousedown', stopPropagation],
  ['close-left', 'touchstart', stopPropagation],
  ['close-center', 'mouseup', closeInfos],
  ['close-center', 'touchend', closeInfos],
  ['close-center', 'mousedown', stopPropagation],
  ['close-center', 'touchstart', stopPropagation],
  ['close-right', 'mouseup', closePInfos],
  ['close-right', 'touchend', closePInfos],
  ['close-right', 'mousedown', stopPropagation],
  ['close-right', 'touchstart', stopPropagation],
  ['scene-switch', 'mouseup', switchHash],
  ['scene-switch', 'touchend', switchHash],
  ['scene-switch', 'mousedown', stopPropagation],
  ['scene-switch', 'touchstart', stopPropagation],
  ['infos-wrapper', 'mouseup', stopPropagation],
  ['infos-wrapper', 'touchend', stopPropagation],
  ['infos-wrapper', 'mousedown', stopPropagation],
  ['infos-wrapper', 'touchstart', stopPropagation],
  ['planet-infos', 'mouseup', stopPropagation],
  ['planet-infos', 'touchend', stopPropagation],
  ['planet-infos', 'mousedown', stopPropagation],
  ['planet-infos', 'touchstart', stopPropagation],
  ['con-link', 'click', lookAtConstellation],
  ['random-star', 'click', randomStar],
  ['show-con', 'click', () => {skySphere.toggleLinks(); toggle('show-con');}],
  ['show-names', 'click', () => {skySphere.toggleNames(); toggle('show-names');}],
  ['show-card', 'click', () => {skySphere.toggleHoriz(); toggle('show-card');}],
  ['menu', 'click', stopPropagation],
  ['menu', 'mousedown', stopPropagation],
  ['menu', 'mouseup', stopPropagation],
  ['connect-button', 'click', showLogin ],
  ['register-button', 'click', showRegister ],
  ['back-connection', 'click', showMenu ],
  ['back-register', 'click', showMenu ],
  ['back-favorites', 'click', showMenu ],
  ['gotoregister', 'click', showRegister ],
  ['set-orien', 'click', () => { skySphere.toggleControlWithOrientation();}],
  ['disconnect-button', 'click', disconnect],
  ['favorites-button', 'click', showFavorites],
  ['about-button', 'click', showAbout],
  ['searchField', 'click', stopPropagation],
  ['searchField', 'mousedown', stopPropagation],
  ['searchField', 'mouseup', stopPropagation],
  ['searchField', 'mousemove', stopPropagation]
  // ['searchField', 'focusout', emptySearchResults]
]

for (let i = 0; i < events.length; i++) {
  document.getElementById(events[i][0]).addEventListener(events[i][1], events[i][2]);
}
console.log("Attached event listeners");

document.getElementById('searchField').addEventListener(
  'keyup', onSearchFieldChange
);

/**
 * Display loader on document loading
 *
 */
function onLoad() {
  if (skySphere.loaded && planets.loaded) {
    const hash = window.location.hash.substring(1);
    previousHash = hash;

    if (hash !== '') {
      updateHash(true);
    } else {
      // Initialize landing page (skymap)
      camera = skySphere.camera;
      scene = skyScene;
      sceneUpdate = () => {
        skySphere.update()
      };
    }

    hideLoading();

    // Launching scene update
    const update = () => {
      requestAnimationFrame(update);
      TWEEN.update();
      sceneUpdate();
      renderer.render(scene, camera);
    };
    update();
  }
}
/**
 * Handler for switching between skymap and solar system
 */
function switchScene() {
  showLoading();

  // For real doe ? http://m.memegen.com/7g0fj3.jpg
  setPlaceholder("searchField", "Rechercher...");

  setTimeout(function () {
    if (home) {
      camera = planets.camera;
      scene = planetsScene;
      sceneUpdate = () => {
        planets.update()
      };
      home = false;
      planets.lookAtAll();
    } else {
      camera = skySphere.camera;
      scene = skyScene;
      sceneUpdate = () => {
        skySphere.update()
      };
      home = true;
    }
    hideLoading();
  }, 1000);
}

/**
 * Function to find target of hash among possible objects
 * @param {string} hash : the hash from the window URI, stripped from
 * superfluous "-open" or other
 */
function findTarget(hash) {
  let target = {};
  target.s = null;
  target.c = null;
  target.p = null;
  target.m = null;

  for (let i = 0; i < skySphere.starsObjects.length; i++) {
    if (hash === skySphere.starsObjects[i].meshName) {
      target.s = skySphere.starsObjects[i];
    }
  }

  // ... planets and moons ...
  for (let i = 0; i < planets.planets.length; i++) {
    if (hash === planets.planets[i].name) {
      target.p = planets.planets[i];
      return target;
    }

    for (let j = 0; j < planets.planets[i].moons.length; j++) {
      if (hash === planets.planets[i].moons[j].name) {
        target.m = planets.planets[i].moons[j];
        return target;
      }
    }
  }

  // ... or constellations.
  for (let i = 0; i < skySphere.constellationObjects.length; i++) {
    if (hash === skySphere.constellationObjects[i].nameObject.name) {
      target.c = skySphere.constellationObjects[i];
    }
  }

  return target;
}

/**
 * Sets scene focus on target planet
 * @param {*} starting boolean === true if application is just starting
 * @param {*} state === "open" if info panel is open
 * @param {*} planet string, name of the target planet
 */
function focusOnPlanet(starting, state, planet) {
  // Reached a planet via a hyperlink
  if (starting) {
    home = false;
    camera = planets.camera;
    scene = planetsScene;
    sceneUpdate = () => {
      planets.update()
    };
  }

  // Opening info panel
  if (state !== null && state === "open") {
    /*enable('planet-infos-wrapper');
    enable('planet-infos');*/
    showPlanet();
  }

  // Closing info panel
  if (state === null) {
    /*disable('planet-infos-wrapper');
    disable('planet-infos');*/
    hideRightModal();
  }

  // Changing scene starmap -> planets
  if (home) {
    showLoading();
    setTimeout(() => {
      camera = planets.camera;
      scene = planetsScene;
      sceneUpdate = () => {
        planets.update()
      };
      hideLoading();
      planets.lookAtPlanet(planet);
      home = false;
    }, 1000);
  } else {
    planets.lookAtPlanet(planet);
  }
  home = false;
}

function focusOnMoon(starting, state, moon) {
  // Reached a moon via a hyperlink
  if (starting) {
    home = false;
    camera = planets.camera;
    scene = planetsScene;
    sceneUpdate = () => {
      planets.update()
    };
  }

  // Opening info panel
  if (state !== null && state === "open") {
    /*enable('planet-infos-wrapper');
    enable('planet-infos');*/
    console.log("Showing moon informations");
    showMoon();
  }

  // Closing info panel
  if (state === null) {
    /*disable('planet-infos-wrapper');
    disable('planet-infos');*/
    hideRightModal();
  }

  // Changing scene starmap -> planets
  if (home) {
    showLoading();
    setTimeout(() => {
      camera = planets.camera;
      scene = planetsScene;
      sceneUpdate = () => {
        planets.update()
      };
      hideLoading();
      planets.lookAtMoon(moon);
      home = false;
    }, 1000);
  } else {
    planets.lookAtMoon(moon);
  }
  home = false;
}

/**
 * Sets scene focus on target star|constellation
 * @param {boolean} starting boolean === true if application is just starting
 * @param {string} state === "open" if info panel is open
 * @param {string} star string, name of the target star
 * @param {string} constellation string, name of the target constellation
 */
function focusOnStarmapObject(starting, state, home, star, constellation) {
  // If application is just loading, focusing on starmap scene
  if (starting) {
    camera = skySphere.camera;
    scene = skyScene;
    sceneUpdate = () => {
      skySphere.update()
    };
  } else {
    // Handling display of info panel
    if (state !== null && state === "open") {
      showCenterModal();
      show('star-panel');
    }
    if (state === null) {
      hideCenterModal();
    }
    // If not at homepage, loading function is called
    if (!home) {
      showLoading();
      setTimeout(() => mountStarmapAndLookAt(star, constellation), 1000);
    }
  } // End starting || !starting
  lookAtSkymapTarget(star, constellation);
}

/**
 * Makes scene look at at a starmap target
 * @param {string} star
 * @param {string} constellation
 */
function lookAtSkymapTarget(star, constellation) {
  if (star !== null) {
    skySphere.lookAtStar(star);
  } else if (constellation !== null) {
    skySphere.lookAtConstellation(constellation);
  }
}

/**
 * Callable to mount starmap and look at target
 */
function mountStarmapAndLookAt(star, constellation) {
  camera = skySphere.camera;
  scene = skyScene;
  home = true;
  sceneUpdate = () => {
    skySphere.update()
  };
  hideLoading();
  lookAtSkymapTarget(star, constellation);
}

/**
 * Handle switching according to hash and global state and returns true if scene
 * has switched, false if not
 * @param {string} hash
 */
function hasSceneSwitched(hash) {
  // Switching scenes skymap <-> solar system
  if ((hash === "SystemeSolaire" && scene === skyScene) ||
    ((hash === "Etoiles" || hash === "") && scene === planetsScene)) {
    switchScene();
    if ((hash === "Etoiles" || hash === "")) {
      hideRightModal();
    }
    return true;

    // Switching from planet narrow view to wide view in solar system
  } else if (hash === "SystemeSolaire") {
    home = false;
    camera = planets.camera;
    scene = planetsScene;
    sceneUpdate = () => {
      planets.update()
    };
    planets.lookAtAll();
    return true;

    // Switching to startup skymap view
  } else if (hash === "Etoiles") {
    home = true;
    camera = skySphere.camera;
    scene = skyScene;
    sceneUpdate = () => {
      skySphere.update()
    };
    skySphere.rearrange();
    hideRightModal();
    return true;
  }
  return false;
}

/**
 * Handler for hash navigation
 *
 * @param {boolean} starting
 * @returns
 */
function updateHash(starting) {
  // Destructuring hash to find root of id
  const splinters = window.location.hash.substring(1).split("-");
  const hash = decodeURI(splinters[0]);
  const state = (splinters.length > 1 ? splinters[1] : null);

  // Switching scenes, if needed, according to hash and global state of scene
  const switched = hasSceneSwitched(hash);
  // Finding target
  const {
    s: star,
    c: constellation,
    p: planet,
    m: moon
  } = findTarget(hash);
  previousHash = hash;

  if (
    !switched
    && star === null
    && planet === null
    && constellation === null
    && moon === null
  ) {
    window.location.hash = '#Etoiles';
    return;
  }
  if (
    star !== null && planet !== null ||
    star !== null && constellation !== null ||
    constellation !== null && planet !== null
    ) {
    console.log("Excuse me what the fuck ?");
    window.location.replace("https://huit.re/PHJa91WW");
  }

  const switchButton = document.getElementById("scene-switch");
  switchButton.innerHTML = "Carte céleste";
  if (planet !== null) {
    focusOnPlanet(starting, state, planet);
  } else if (moon !== null) {
    focusOnMoon(starting, state, moon);
  } else if (hash !== 'SystemeSolaire') {
    switchButton.innerHTML = "Système Solaire";
    focusOnStarmapObject(starting, state, home, star, constellation);
  }
  return;
}

function hideLoading() {
  /* Activation de l'animation de fade-out du loading */
  const loadingScreen = document.getElementById('loader-wrapper');
  loadingScreen.classList.remove('fade-in');
  loadingScreen.classList.add('fade-out');
}

function showLoading() {
  /* Activation de l'animation de fade-out du loading */
  const loadingScreen = document.getElementById('loader-wrapper');
  loadingScreen.classList.remove('fade-out');
  loadingScreen.classList.add('fade-in');
}

function onMove(event) {
  if (home) {
    skySphere.onMove(event);
  } else {
    planets.onMove(event);
  }
}

function onMouseDown(event) {
  if (home) {
    skySphere.onMouseDown();
  } else {
    planets.onMouseDown(event);
  }
}

function onMouseUp(event) {
  if (home) {
    skySphere.onMouseUp(event);
  } else {
    planets.onMouseUp(event);
  }
}

function onTouchStart(event) {
  if (home) {
    skySphere.onTouchStart(event);
  } else {
    planets.onTouchStart(event);
  }
}

function onTouchEnd(event) {
  if (home) {
    skySphere.onTouchEnd(event);
  } else {
    planets.onTouchEnd(event);
  }
}

function onTouchMove(event) {
  if (home) {
    skySphere.onTouchMove(event);
  } else {
    planets.onTouchMove(event);
  }
}

function openMenu(event) {
  event.stopPropagation();
  showMenu();
}

function closeMenu(event) {
  event.stopPropagation();
  hideLeftModal();
}

/**
 * Close the modal window with Star informations
 * @param {event} event
 */
function closeInfos(event) {
  event.stopPropagation();
  // DEAD CODE
  //window.history.back();
  //disable('infos-wrapper');
  //disable('infos');
  if (isVisible('star-panel') || isVisible('constellation-panel')) {
    window.location.hash = window.location.hash.split("-")[0];
  }
  else {
    hideCenterModal();
  }
}

/**
 * Close the modal window with informations
 * @param {event} event Close modal window event
 */
function closePInfos(event) {
  event.stopPropagation();
  //window.history.back();
  if (isVisible('planet-panel') || isVisible('moon-panel')) {
    window.location.hash = window.location.hash.split("-")[0];
  }
  hideRightModal();
}

/**
 * Handler for hash changed event to switch between Constellation view and
 * Solar System view
 * @param {event} event Hash changed event
 */
function switchHash(event) {
  event.stopPropagation();
  closeMenu(event);
  if (scene == skyScene) {
    window.location.hash = '#SystemeSolaire';
    event.target.innerHTML = "Carte céleste";
  } else {
    window.location.hash = '#Etoiles';
    event.target.innerHTML = "Système Solaire"
  }
}

/**
 * Handler for looking at Constellation event
 * @param {event} event
 */
function lookAtConstellation(event) {
  window.location.hash = document.getElementById('con-name')
    .innerHTML + "-open";
}

/**
 * Returns a random Star
 * @param {event} event
 */
function randomStar(event) {
  const random = Math.round(Math.random() * skySphere.starsObjects.length);
  window.location.hash = skySphere.starsObjects[random].meshName + "-open";
}


function populateTags(tags, tagsDiv) {
  for (let tag of tags) {
    const div = document.createElement('div');
    div.classList.add('tag');
    div.innerHTML = tag;
    tagsDiv.appendChild(div);

    // If the tag is the first tag (which should be the name of the current
    // object), we make it non-clickabe. Otherwise, it should lend to the
    // search for the same kind of objects
    if (tag === tags[0]) {
      div.classList.add('non-clickable');
    } else {
      div.classList.add('clickable');
      div.addEventListener('click', (event) => {
        let tagname = event.target.innerHTML;
        switch(tagname) {
          case "Étoile":
            tagname = "star";
            break;
          case "Lune":
            tagname = "moon";
            break;
          case "Planète":
            tagname = "planet";
            break;
          case "Constellation":
            tagname = "constellation";
            break;
          default:
            break;
        }
        document.getElementById('searchField').value = tagname;

        const tagIsPublic = tagname === "star" || tagname === "moon" || tagname === "planet" || tagname === "constellation";
        let url = "";
        if (sessionStorage.getItem('isAuthenticated') === 'false'
            || tagIsPublic){
          url = '/api/public/tag/' + tagname;
        } else {
          url = '/api/public/connected/' + sessionStorage.getItem("username") + '/tag/' + tagname;
        }

        let requestParam =
          { method: "GET"
          , headers :
            { 'Accept': 'application/json'
            , 'Content-Type': 'application/json'
            }
          };

        fetch(url, requestParam)
          .then((res) => res.json())
          .then(populateSearchResults)
          .then(console.debug)
          .catch(console.error);
      });
      // Add here logic for searching objects of same type
    }
  }
  addPlusTag(tagsDiv)
}

function addPlusTag(tags) {
  let addTag = document.createElement('div');
  addTag.classList.add("tag");
  addTag.classList.add("add-tag");
  addTag.innerHTML = "+";
  tags.appendChild(addTag);

  addTag.addEventListener('click', (event) => {
    let target = event.target;
    target.innerHTML = '';
    let tagInput = document.createElement('input');
    target.appendChild(tagInput);
    tagInput.focus();
    tagInput.addEventListener('focusout', (event) => {
      target.innerHTML = "+";
    });

    tagInput.addEventListener('keyup', (event) => {
      if (event.keyCode == 13) {
        target.innerHTML = event.target.value;
        target.classList.remove("add-tag");

        // We have to clone it so it will lose all attached listeners
        let targetClone = target.cloneNode(true);
        tags.replaceChild(targetClone, target);
        addPlusTag(tags);
      }
    });
  });
}

function onSearchFieldChange(event) {
  const query = event.target.value;
  if (query === "" || query === null || query === undefined) {
    emptySearchResults();
    return;
  }
  const url = (sessionStorage.getItem("isAuthenticated") === 'true')
    ? '/api/public/connected/' + sessionStorage.getItem("username") + '/search/' + query
    : '/api/public/search/' + query;
  fetch(
    url,
    {
      method: 'GET',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  ).then((res) => res.json())
  .then(populateSearchResults)
  .catch(console.error);
}

function populateSearchResults(res) {
  show("search-results");
  let searchResDOM = document.getElementById("search-results");
  searchResDOM.innerHTML = '';
  for (let resultValue of res) {
    let searchResult = document.createElement('div');
    let resultName = document.createElement('span');
    let resultType = document.createElement('span');
    searchResult.appendChild(resultName);
    searchResult.appendChild(resultType);
    resultName.innerHTML = resultValue["name"];
    resultType.innerHTML = resultValue["type"];
    searchResult.classList.add("search-result", "link");
    resultName.classList.add("search-result-name", "clickable");
    resultType.classList.add("search-result-type");

    searchResult.addEventListener('click', (event) => {
      console.log("click click bande de s...");
      window.location.hash = '#' + resultValue["name"] + "-open";
      hide('search-results');
      stopPropagation(event);
    });

    searchResult.addEventListener('mousedown', stopPropagation);
    searchResult.addEventListener('mouseup', stopPropagation);

    searchResDOM.appendChild(searchResult);
  }

  hideLeftModal();
  hideRightModal();
  hideCenterModal();
}

function populateAddToFavorite(parent, button, target) {
  let clone = button.cloneNode(true);
  parent.replaceChild(clone, button);
  clone.innerHTML = "Ajouter aux favoris";
  clone.addEventListener("click", (event) => {
    console.log("Favoriting " + target.meshName);
  });
}
