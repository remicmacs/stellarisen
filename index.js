//var noSleep = new NoSleep();
//noSleep.enable();

console.log("Loading init script");

const skyScene = new THREE.Scene();
const planetsScene = new THREE.Scene();
let camera = null;
let scene = null;
const renderer = new THREE.WebGLRenderer({
	antialias: true
});

window.onhashchange = () => {
	updateHash(false);
};

const skySphere = new SkySphere(skyScene, camera, renderer, onLoad);
const planets = new Planets(planetsScene, camera, renderer, onLoad);

let sceneUpdate = null;
let home = true;

let previousHash = null;

// Adding renderer to webpage
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
console.log("Renderer added to webpage");

document.addEventListener('mousemove', onMove);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('touchstart', onTouchStart);
document.addEventListener('touchend', onTouchEnd);

const events = [
	['userImage', 'mouseup', openMenu],
	['userImage', 'touchend', openMenu],
	['userImage', 'mousedown', stopPropagation],
	['userImage', 'touchstart', stopPropagation],
	['close-menu', 'mouseup', closeMenu],
	['close-menu', 'touchend', closeMenu],
	['close-menu', 'mousedown', stopPropagation],
	['close-menu', 'touchstart', stopPropagation],
	['close-infos', 'mouseup', closeInfos],
	['close-infos', 'touchend', closeInfos],
	['close-infos', 'mousedown', stopPropagation],
	['close-infos', 'touchstart', stopPropagation],
	['close-pinfos', 'mouseup', closePInfos],
	['close-pinfos', 'touchend', closePInfos],
	['close-pinfos', 'mousedown', stopPropagation],
	['close-pinfos', 'touchstart', stopPropagation],
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
	['con-name', 'click', lookAtConstellation],
	['random-star', 'click', randomStar]
]

for (let i = 0; i < events.length; i++) {
	document.getElementById(events[i][0]).addEventListener(events[i][1], events[i][2]);
}
console.log("Attached event listeners");

/**
 * Handler for switching between skymap and solar system
 */
function switchScene() {
	showLoading();
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
 * @param {*} hash : the hash from the window URI, stripped from superfluous
 * "-open" or other
 */
function findTarget(hash) {
	let target = {};
	target.s = null;
	target.c = null;
	target.p = null;

	for (let i = 0; i < skySphere.starsObjects.length; i++) {
		if (hash === skySphere.starsObjects[i].meshName) {
			target.s = skySphere.starsObjects[i];
		}
	}

	// ... planets, ...
	for (let i = 0; i < planets.planets.length; i++) {
		if (hash === planets.planets[i].name) {
			target.p = planets.planets[i];
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

function updateHash(starting) {
	// Destructuring hash to find root of id
	const splinters = window.location.hash.substring(1).split("-");
	const hash = decodeURI(splinters[0]);
	const state = (splinters.length > 1 ? splinters[1] : null);

	// Switching scenes skymap <-> solar system
	if ((hash === "SystemeSolaire" && scene === skyScene) ||
		(hash === "Etoiles" && scene === planetsScene)) {
		switchScene();
		return;

		// Switching from planet narrow view to wide view in solar system
	} else if (hash === "SystemeSolaire") {
		home = false;
		camera = planets.camera;
		scene = planetsScene;
		sceneUpdate = () => {
			planets.update()
		};
		planets.lookAtAll();
		return;

		// Switching to startup skymap view
	} else if (hash === "Etoiles") {
		home = true;
		camera = skySphere.camera;
		scene = skyScene;
		sceneUpdate = () => {
			skySphere.update()
		};
		skySphere.rearrange();
		return;
	}

	// Finding target
	const {
		s: star,
		c: constellation,
		p: planet
	} = findTarget(hash);
	previousHash = hash;

	if (star === null && planet === null && constellation === null ||
		star !== null && planet !== null ||
		star !== null && constellation !== null ||
		constellation !== null && planet !== null) {
		console.log("Excuse me what the fuck ?");
		window.location.replace("https://huit.re/PHJa91WW");
	}

	if (planet !== null) {
		if (starting) {
			home = false;
			camera = planets.camera;
			scene = planetsScene;
			sceneUpdate = () => {
				planets.update()
			};
		}
		if (state !== null && state === "open") {
			enable('planet-infos-wrapper');
			enable('planet-infos');
		}
		if (state === null) {
			disable('planet-infos-wrapper');
			disable('planet-infos');
		}
		if (home) {
			showLoading();
			setTimeout(() => {
				// Initialisation à la page des planetes
				home = false;
				camera = planets.camera;
				scene = planetsScene;
				sceneUpdate = () => {
					planets.update()
				};
				hideLoading();
				planets.lookAtPlanet(planet);
			}, 1000);
		} else {
			planets.lookAtPlanet(planet);
		}
		// Ici on va mettre tout ce qui est changement de planète
	} else {
		if (starting) {
			camera = skySphere.camera;
			scene = skyScene;
			sceneUpdate = () => {
				skySphere.update()
			};
		} else {
			if (state !== null && state === "open") {
				enable('infos-wrapper');
				enable('infos');
			}
			if (state == null) {
				disable('infos-wrapper');
				disable('infos');
			}
			// Si on est pas sur l'écran des étoiles, on montre le loading
			if (!home) {
				showLoading();
				setTimeout(function () {
					camera = skySphere.camera;
					scene = skyScene;
					home = true;
					sceneUpdate = () => {
						skySphere.update()
					};
					hideLoading();

					/* Une fois le loading fini, on bouge la caméra vers l'étoile */
					if (star != null) {
						skySphere.lookAtStar(star);
					}
				}, 1000);
			}
		}

		/* Si on est déjà sur l'écran des étoiles, on bouge la caméra */
		if (home) {
			if (star != null) {
				skySphere.lookAtStar(star);
			} else if (constellation != null) {
				skySphere.lookAtConstellation(constellation);
			}
		}
	}
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
		skySphere.onTouchStart();
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

function openMenu(event) {
	event.stopPropagation();
	enable('menu');
}

function closeMenu(event) {
	event.stopPropagation();
	disable('menu');
}

function closeInfos(event) {
	event.stopPropagation();
	//window.history.back();
	//disable('infos-wrapper');
	//disable('infos');
	window.location.hash = window.location.hash.split("-")[0];
}

function closePInfos(event) {
	event.stopPropagation();
	window.history.back();
}

function switchHash(event) {
	event.stopPropagation();
	disable('menu');
	if (scene == skyScene) {
		window.location.hash = '#SystemeSolaire';
	} else {
		window.location.hash = '#Etoiles';
	}
}

function lookAtConstellation(event) {
	window.location.hash = document.getElementById('con-name').innerHTML + "-open";
}

function randomStar(event) {
	let random = Math.round(Math.random() * skySphere.starsObjects.length);
	window.location.hash = skySphere.starsObjects[random].meshName + "-open";
}