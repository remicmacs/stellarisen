/**
 * Represents the landing page skymap
 *
 * @class SkySphere
 */
class SkySphere {
	/**
	 * Creates an instance of SkySphere.
	 * @param {Scene} scene Three.js Scene object
	 * @param {Renderer} renderer Three.js Renderer object
	 * @param {function} onLoad Handler for onload browser event
	 * @memberof SkySphere
	 */
	constructor(scene, renderer, onLoad) {
		this.loaded = false;
		this.onLoad = onLoad;
		this.scene = scene;
		this.renderer = renderer;

		this.dragging = false;
		this.mousedown = false;
		this.showLinks = true;
		this.showNames = true;
		this.showHoriz = true;

		this.controlWithOrientation = true;

		// Instantiating Camera
		this.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000
		);
		this.camera.position.set(0, 0, 0);
		this.camera.lookAt(0, 0, -1);

		/*
		 * The clock ensures loading screen will display for a minimum time
		 */
		this.loadingClock = new THREE.Clock();
		this.loadingClock.start();
		this.clock = new THREE.Clock(true);
		this.mouse = new THREE.Vector2();

		/*
		 * Loading manager allow interaction during non-blocking long file loading
		 * and displays a loader animation.
		 */
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onProgress = this.onProgress;
		this.loadingManager.onLoad = () => {
			this.addEverything();
		};

		this.constellationObjects = [];
		this.starsObjects = [];
		this.visor = undefined;
		this.horizon = undefined;

		this.deviceIsMobile = (typeof window.orientation !== "undefined") ||
			(navigator.userAgent.indexOf('IEMobile') !== -1);

		/*
		 * Camera is included in a pitch object used for control of pitch
		 *  (up / down) axis.
		 * The pitch object is included in yaw control object (left / right axis)
		 * Allows for FPS-style rotation with unattached coordinate systems
		 */
		this.pitchObject = new THREE.Object3D();
		this.yawObject = new THREE.Object3D();
		this.pitchObject.add(this.camera);
		this.yawObject.add(this.pitchObject);
		this.scene.add(this.yawObject);

		if (this.deviceIsMobile) {
			this.controls = new THREE.DeviceOrientationControls(this.camera);
		}

		//var mouse = new THREE.Vector2(), INTERSECTED;
		this.raycaster = new THREE.Raycaster();

		this.json = {};
		this.linksJson = {};
		this.constellationFont = undefined;
		this.skydomeTexture = undefined;
		this.visorTexture = undefined;
		this.lockedTexture = undefined;
		this.starTexture = undefined;

		/* On prépare des Loaders qui sont ajoutés au LoadingManager,
		cela nous permet de suivre leur évolution et de prendre action lorsqu'ils
		ont fini */

		// Instantiating stars ...
		const starsFileLoader = new THREE.FileLoader(this.loadingManager);
		// ... constellations ...
		const linksFileLoader = new THREE.FileLoader(this.loadingManager);
		// ... font ...
		const constellationFontLoader = new THREE.FontLoader(this.loadingManager);
		// ... and textures loaders
		const skydomeTextureLoader = new THREE.TextureLoader(this.loadingManager);
		const visorTextureLoader = new THREE.TextureLoader(this.loadingManager);
		const lockedTextureLoader = new THREE.TextureLoader(this.loadingManager);
		const starTextureLoader = new THREE.TextureLoader(this.loadingManager);

		// Loading data
		// @TODO: replace by XHR / DB calls
		starsFileLoader.load('res/stars.json', (response) => {
			this.json = JSON.parse(response);
		});
		linksFileLoader.load("res/links.json", (response) => {
			this.linksJson = JSON.parse(response);
		});

		// Launching all resources loaders
		constellationFontLoader.load('fonts/Share_Regular.json', (font) => {
			this.constellationFont = font;
		});
		skydomeTextureLoader.load("res/images/milkyway.png", (texture) => {
			this.skydomeTexture = texture;
		});
		visorTextureLoader.load("res/images/visor.png", (texture) => {
			this.visorTexture = texture;
		});
		lockedTextureLoader.load("res/images/locked.png", (texture) => {
			this.lockedTexture = texture;
		});
		starTextureLoader.load("res/images/star.png", (texture) => {
			this.starTexture = texture;
		});

		this.previousClosestStar = undefined;
		this.previousClosestStarScale = new THREE.Vector3();

		window.addEventListener('resize', () => {
			this.rearrange();
		});
	}


	/**
	 * Update procedure for SkySphere object
	 * @memberof SkySphere
	 */
	update() {
		/* Not used for now but could be useful for animations to know time deltas
		 *  betwen frames */
		// const delta = this.clock.getDelta();

		if (this.deviceIsMobile && this.controlWithOrientation) {
			this.controls.update();
		}

		const sphereRaycast = new THREE.Vector3();
		if (this.deviceIsMobile && this.controlWithOrientation) {
			sphereRaycast.setFromSphericalCoords(
				-100,
				this.camera.rotation.x + Math.PI / 2,
				this.camera.rotation.y
				);
		} else {
			sphereRaycast.setFromSphericalCoords(
				-100,
				this.pitchObject.rotation.x + Math.PI / 2,
				this.yawObject.rotation.y
			);
			this.raycaster.setFromCamera(this.mouse, this.camera );
		}

		/*
		 * Udpdating constellation names :
		 *  * Changing opacity according to distance
		 *  * Aligning to camera
		 */
		for (let i = 0; i < this.constellationObjects.length; i++) {
			const constellationName = this.constellationObjects[i].nameObject;
			/*
			 * Processing the distance between the camera's view raycast on the
			 * SkySphere and the current object's position.
			 */
			const distance = sphereRaycast.distanceTo(constellationName.position);
			this.constellationObjects[i].updateNames(distance, this.camera);
		}


		let minDistance = 100;
		let minDistanceObject = undefined;
		const distanceThreshold = 10;
		const angle = new THREE.Spherical();
		const projection = new THREE.Vector3();
		if (!this.deviceIsMobile) {
			/*
			 * Recovering magnitud vector of raycast in cartesian coordinates casted
			 *  in spherical.
			 */
			angle.setFromCartesianCoords(
				this.raycaster.ray.direction.x,
				this.raycaster.ray.direction.y,
				this.raycaster.ray.direction.z
			);

			/*
			 * Using spherical to cast a projection on sphere
			 */
			projection.setFromSphericalCoords(100, angle.phi, angle.theta);
		}

		/*
		 * Finding object closest to cursor
		 */
		for (let i = 0; i < this.starsObjects.length; i++) {
			const star = this.starsObjects[i];
			let distance = 100;

			distance = (
					this.deviceIsMobile ?
					sphereRaycast :
					projection
				).distanceTo(star.position);

			/*
			 * Looking for minimum only below a threshold
			 */
			if (distance < distanceThreshold) {
				if (distance < minDistance) {
					minDistance = distance;
					minDistanceObject = star;
				}
			}
		}

		/* Si on a trouvé une étoile proche, on déplace le curseur */
		/*
		 * Sticking cursor to nearest object, if found any
		 */
		if (minDistanceObject != undefined) {
			if (minDistanceObject != this.previousClosestStar) {
				this.visor.setTarget(minDistanceObject);
				//console.log("Closest star: " + minDistanceObject.meshName);
			}
			this.previousClosestStar = minDistanceObject;
		} else {
			this.previousClosestStar = undefined;
			if (this.visor != undefined && this.visor.isVisible()) {
				this.visor.hide();
			}
		}


		/*for (let i = 0; i < constellationObjects.length; i++) {
			let constellationBarycenter = toCartesian(100, constellationObjects[i]["ra"], constellationObjects[i]["dec"]);
			let distance = new THREE.Vector3().fromArray(sphereRaycast).distanceTo(new THREE.Vector3().fromArray(constellationBarycenter));
			if (distance > 100) {
				for (let j = 0; j < constellationObjects[i]["lines"].length; j++) {
					if (constellationObjects[i]["lines"][j].visible) {
						constellationObjects[i]["lines"][j].visible = false;
					}
				}
			}
			else if (distance < 100) {
				for (let j = 0; j < constellationObjects[i]["lines"].length; j++) {
					if (!constellationObjects[i]["lines"][j].visible) {
						constellationObjects[i]["lines"][j].visible = true;
					}
				}
			}
			if (distance < 100) {
				if (distance < 50) {
					constellationObjects[i].material.opacity = 1;
				}
				else {
					constellationObjects[i].material.opacity = 1 - ((distance - 50) / 50);
				}
			}
		}*/
	}


	onProgress(item, loaded, total) {
		console.log("Loading: " + loaded + "/" + total);
	}


	/**
	 *	Add everything to the scene
	 */
	addEverything() {
		this.addConstellationsToScene();

		if (this.skydomeTexture != undefined) {
			this.addSkydomeToScene();
		}

		this.addHorizonToScene();
		//this.addCardinalsToScene();

		this.visor = new Visor(this.visorTexture, this.lockedTexture);
		this.visor.addToScene(this.scene);

		// Displays loading for a minimum time
		while (this.loadingClock.getElapsedTime() < 1) {}

		// Stopping loading clock
		this.loadingClock.stop();

		/*
		 * Changing Renderer size and pixel ratio for phone display
		 */
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.loaded = true;
		this.onLoad();
	}


	/**
	 *	Add constellations to the scene
	 */
	addConstellationsToScene() {
		const count = Object.keys(this.linksJson).length;

		for (let i = 0; i < count; i++) {
			const shortName = Object.keys(this.linksJson)[i];
			const constellationJson = this.linksJson[shortName];
			const dict = {
				"ra": constellationJson["ra_barycenter"],
				"dec": constellationJson["dec_barycenter"],
				"shortName": shortName,
				"fullName": constellationJson["name"],
				"links": constellationJson["links"],
				"stars": this.json,
				"starTexture": this.starTexture
			};

			const constellation = new Constellation(dict);
			constellation.addToScene(this.scene);
			constellation.generateName(this.constellationFont);
			constellation.addNameToScene(this.scene);
			this.constellationObjects.push(constellation);
			this.starsObjects.push(...constellation.stars);
		}
	}


	/**
	 *	Add skydome to the scene
	 */
	addSkydomeToScene() {
		const skyGeo = new THREE.SphereGeometry(150, 25, 25);
		const material = new THREE.MeshBasicMaterial({
			map: this.skydomeTexture,
			transparent: true
		});
		const sky = new THREE.Mesh(skyGeo, material);
		sky.material.side = THREE.BackSide;
		sky.material.opacity = 0.3;
		this.scene.add(sky);
	}


	/**
	 *	Add horizon to the scene
	 */
	addHorizonToScene() {
		this.horizon = new Horizon(this.constellationFont);
		this.horizon.addToScene(this.scene);
	}


	/**
	 *	Add cardinals points to the scene
	 */
	// addCardinalsToScene() {
	// 	let options = { font: this.constellationFont, size: 5, height: 1, curveSegments: 12, bevelEnabled: false };
	// 	let cardinals = [ "N", "S", "E", "W" ];
	// 	let cardinalsAngles = [ 0, Math.PI, -Math.PI / 2, Math.PI / 2 ];
	// 	let cardinalsPositions =
	// 		[	new THREE.Vector3(0, 4, -110)
	// 		,	new THREE.Vector3(0, 4, 110)
	// 		,	new THREE.Vector3(110, 4, 0)
	// 		,	new THREE.Vector3(-110, 4, 0)
	// 		];
	// 	for (let i = 0; i < cardinals.length; i++) {
	// 		let geometry = new THREE.TextGeometry(cardinals[i], options);
	// 		geometry.center();
	// 		let material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	// 		let mesh = new THREE.Mesh(geometry, material);
	// 		mesh.position.copy(cardinalsPositions[i]);
	// 		mesh.rotation.y = cardinalsAngles[i];
	// 		this.scene.add(mesh);
	// 	}
	// }

	/**
	 * Converts RA/DEC coordinates to cartesian coordinates.
	 *
	* @static
	 * @param {*} r
	 * @param {*} ra RA value of RA/DEC coordinates system
	 * @param {*} dec DEC value of RA/DEC coordinates system
	 * @returns Cartesian coordinates for the SkySphere.
	 * @memberof SkySphere
	 */
	static raDecToCartesian(r, ra, dec) {
		/* The conversion from RA/DEC to cartesion uses a first conversion to
		 * spherical coordinates.
		 * Three.js [uses spherical coordinates](https://threejs.org/docs/#api/en/math/Spherical)
		 * RA: [0;24]. Multiplied by 360/24 (=15) to get degrees
		 * DEC: To obtain degrees, using negative value plus 90° to get the
		 * corresonding degree value
		 */
		const coord = new THREE.Vector3().setFromSphericalCoords(
			r,
			THREE.Math.degToRad(-dec + 90),
			THREE.Math.degToRad(ra * 15)
		);
		return coord;
	}

	/**
	 * Procedure to adapt SkySphere to display resizing
	 *
	 * @memberof SkySphere
	 */
	rearrange() {
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}

	/**
	 * Targets a star and launches animation to look at it.
	 *
	 * @param {*} star
	 * @memberof SkySphere
	 */
	lookAtStar(star) {
		if (deviceIsMobile() && this.controlWithOrientation) {
			this.disableControlWithOrientation();
		}

		// Recovering angles and coordinates of star
		const angle = new THREE.Spherical();
		angle.setFromCartesianCoords(
			star.position.x,
			star.position.y,
			star.position.z
		);

		// Recovering camera angle
		const current = {
			x: this.yawObject.rotation.y,
			y: this.pitchObject.rotation.x
		};

		const diffAngle = (angle.theta - Math.PI) - this.yawObject.rotation.y;
		let newTheta = diffAngle < -Math.PI ? angle.theta + Math.PI : angle.theta - Math.PI;
		newTheta = diffAngle > Math.PI ? newTheta - 2 * Math.PI : newTheta;

		// Calculating final position
		const target = {
			x: newTheta,
			y: Math.PI / 2 - angle.phi
		};

		const diffX = Math.abs(current.x - target.x);
		const diffY = Math.abs(current.y - target.y);
		const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
		const max = Math.sqrt(2 * Math.pow(Math.PI, 2));
		const time = (distance / max) * 3000;

		// Creating tween animation
		const tween = new TWEEN.Tween(current)
			.to(target, time)
			.easing(TWEEN.Easing.Cubic.InOut);

		tween.onUpdate(() => {
			this.yawObject.rotation.y = current.x;
			this.pitchObject.rotation.x = current.y;
		});

		tween.onComplete(() => {
			this.yawObject.rotation.y = angle.theta - Math.PI;
		});

		tween.start();
		this.visor.setLocked(star);

		hideLeftModal();

		// Building the modal dialog content by hand for now
		showStar();

		setSpan("objectName", star.meshName);
		setSpan("con-name", this.getConstellationName(star.constellation));
		setSpan("star-distance", Math.round(star.distance * 3.262));
		setPlaceholder("searchField", star.meshName);
		if (sessionStorage.getItem('isAuthenticated') === "true") {
      const username = sessionStorage.getItem('username');
      const targetname = star.meshName;
      const requestParams = {
        method : "GET",
        headers : {
          'Content-type' : 'application/json',
          'Accept' : 'application/json'
        }
      }
      const url = 'api/public/connected/' + username + '/tags/' + targetname;
      fetch(url, requestParams)
        .then(res => res.json())
        .then((res) => {
					this.visor.star.tags = [targetname, 'Étoile'];
					this.visor.star.tags.push(...res);
          this.updateTags();
        })
        .catch(console.error);
    } else {
      this.updateTags();
    }

		setImgSrc("star-picture", "res/images/image-loading.png");
		const element = document.getElementById("star-picture");
		element.classList.add("rotating");
		element.addEventListener('load',
			() => {
				if (element.src != "res/images/image-loading.png") {
					console.log(element.src);
					element.classList.remove("rotating");
				}
			}
		);

		setImgSrc(
			"star-picture",
			"http://server7.wikisky.org/imgcut?survey=DSS2&w=150&h=150&angle=1.25&ra="
			 + star.ra + "&de=" + star.dec + "&output=PNG"
		);
	}

	/**
	 * Targets a constellation and launches animation to look at it.
	 *
	 * @param {*} constellation
	 * @memberof SkySphere
	 */
	lookAtConstellation(constellation) {
		const angle = new THREE.Spherical();
		angle.setFromCartesianCoords(
			constellation.nameObject.position.x,
			constellation.nameObject.position.y,
			constellation.nameObject.position.z
		);

		const current = {
			x: this.yawObject.rotation.y,
			y: this.pitchObject.rotation.x
		};

		const diffAngle = (angle.theta - Math.PI) - this.yawObject.rotation.y;
		let newTheta = diffAngle < -Math.PI ? angle.theta + Math.PI : angle.theta - Math.PI;
		newTheta = diffAngle > Math.PI ? newTheta - 2 * Math.PI : newTheta;

		// Calculating final position
		const target = {
			x: newTheta,
			y: Math.PI / 2 - angle.phi
		};

		const diffX = Math.abs(current.x - target.x);
		const diffY = Math.abs(current.y - target.y);
		const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
		const max = Math.sqrt(2 * Math.pow(Math.PI, 2));
		const time = (distance / max) * 3000;

		const tween = new TWEEN.Tween(current)
			.to(target, time)
			.easing(TWEEN.Easing.Cubic.InOut);

		tween.onUpdate(() => {
			this.yawObject.rotation.y = current.x;
			this.pitchObject.rotation.x = current.y;
		});

		tween.start();

		showConstellation();

		setSpan("constellation-title", constellation.fullName);
		setPlaceholder("searchField", constellation.fullName);
		//show('star-list');
		this.visor.lockedSprite.visible = false;
		this.visor.setConstellation(constellation);
		if (sessionStorage.getItem('isAuthenticated') === "true") {
      const username = sessionStorage.getItem('username');
      const targetname = constellation.fullName;
      const requestParams = {
        method : "GET",
        headers : {
          'Content-type' : 'application/json',
          'Accept' : 'application/json'
        }
      }
      const url = 'api/public/connected/' + username + '/tags/' + targetname;
      fetch(url, requestParams)
        .then(res => res.json())
        .then((res) => {
					constellation.tags = [targetname, 'Constellation'];
					constellation.tags.push(...res);
          this.updateTags();
        })
        .catch(console.error);
    } else {
      this.updateTags();
    }

		const list = document.getElementById('stars-list');
		list.innerHTML = '';

		// Display a list of stars that are part of the constellation
		for (let i = 0; i < this.starsObjects.length; i++) {
			if (
				this.starsObjects[i].constellationObject.fullName
				== constellation.fullName
				) {
				const row = document.createElement('div');
				row.classList.add('data-row');
				const value = document.createElement('div');
				value.classList.add('data-value');
				value.classList.add('alone');
				value.classList.add('link');
				row.appendChild(value);
				const text = document.createTextNode(this.starsObjects[i].meshName);
				value.appendChild(text);
				value.addEventListener('click', (event) => {
					window.location.hash = text.textContent + "-open";
				})
				list.appendChild(row);
			}
		}
	}

	/**
	 * Move event handler.
	 *
	 * Handles `mousemove` events.
	 *
	 * @param {*} event
	 * @memberof SkySphere
	 */
	onMove(event) {
		event.preventDefault();
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		if (this.mousedown) {
			this.onDrag(event);
		}
	}

	onTouchMove(event) {
		// console.log("moving: " + this.mousedown);
		// if (this.mousedown) {
		// 	this.onFingerDrag(event);
		// }
		this.mouse.x = (event.touches[0].screenX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.touches[0].screenY / window.innerHeight) * 2 + 1;

		if (this.controlWithOrientation) {
			this.disableControlWithOrientation();
		}
		this.onFingerDrag(event);
	}

	/**
	 * Drag event handler.
	 * @param {DragEvent} event
	 */
	onDrag(event) {
		this.dragging = true;
		this.yawObject.rotation.y += event.movementX * 0.01;
		this.pitchObject.rotation.x += event.movementY * 0.01;

		// X rotation bounding. Avoids the camera to ever get upside-down
		this.pitchObject.rotation.x = Math.max(
			-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x)
		);
	}

	/**
	 * Click event handler.
	 * @param {*} event
	 */
	onClick(event) {
		// Find intersections
		this.raycaster.setFromCamera(this.mouse, this.camera);
		const intersects = this.raycaster.intersectObjects(this.scene.children);
		if (intersects.length > 0) {

			for (let i = 0; i < intersects.length; i++) {
				if (intersects[i].object == this.visor.sprite) {
					// let hash = window.location.hash.substring(1);
					window.location.hash = "#" + this.visor.star.meshName;
					const star = this.visor.star;

					// Processing coordinates and transition values
					const angle = new THREE.Spherical();
					angle.setFromCartesianCoords(
						star.position.x,
						star.position.y,
						star.position.z
					);

					const current = {
						x: this.yawObject.rotation.y,
						y: this.pitchObject.rotation.x
					};

					const diffAngle = (angle.theta - Math.PI) - this.yawObject.rotation.y;
					let newTheta = diffAngle < -Math.PI ? angle.theta + Math.PI : angle.theta - Math.PI;
					newTheta = diffAngle > Math.PI ? newTheta - 2 * Math.PI : newTheta;

					// Calculating final position
					const target = {
						x: newTheta,
						y: Math.PI / 2 - angle.phi
					};

					const diffX = Math.abs(current.x - target.x);
					const diffY = Math.abs(current.y - target.y);
					const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
					const max = Math.sqrt(2 * Math.pow(Math.PI, 2));
					const time = (distance / max) * 3000;

					setTimeout(() => {
						window.location.hash = "#" + star.meshName + "-open";
					}, time);
				}
			}
		} else {
			//if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			INTERSECTED = null;
		}
	}

	/**
	 * Handles `mousedown` events.
	 *
	 * @memberof SkySphere
	 */
	onMouseDown() {
		this.mousedown = true;
	}

	/**
	 * Handles `mouseup` events.
	 *
	 * @param {*} event
	 * @memberof SkySphere
	 */
	onMouseUp(event) {
		if (!this.dragging) {
			this.yawObject.rotation.y = ((this.yawObject.rotation.y * 10000) % (2 * Math.PI * 10000)) / 10000;
			this.onClick(event);
		}
		this.mousedown = false;
		this.dragging = false;
	}

	/**
	 * Handles touch events
	 * @param {*} event
	 */
	onTouchStart(event) {
		this.mouseDown = true;

		this.previousX = event.touches[0].screenX;
		this.previousY = event.touches[0].screenY;
		this.mouse.x = this.previousX;
		this.mouse.y = this.previousY;

		//console.log("touch start: " + this.mouseDown);
	}

	/**
	 * Handles touchend event as clicks
	 * @param {*} event
	 */
	onTouchEnd(event) {
		//console.log("touch end: " + this.mousedown);
		if (!this.dragging) {
			this.yawObject.rotation.y = ((this.yawObject.rotation.y * 10000) % (2 * Math.PI * 10000)) / 10000;
			this.onClick(event);
		}

		this.mouseDown = false;
		this.dragging = false;
	}

	/**
	 * Handles touch drag events
	 * @param {*} event
	 */
	onFingerDrag(event) {
		if (event.touches.length == 1) {
			this.dragging = true;
			const deltaX = this.previousX - event.touches[0].screenX;
			const deltaY = this.previousY - event.touches[0].screenY;
			this.previousX = event.touches[0].screenX;
			this.previousY = event.touches[0].screenY;
			this.yawObject.rotation.y += -deltaX * 0.002;
			this.pitchObject.rotation.x += -deltaY * 0.002;

			// X rotation bounding. Avoids the camera to ever get upside-down
			this.pitchObject.rotation.x = Math.max(
				-Math.PI / 2,
				Math.min(Math.PI / 2, this.pitchObject.rotation.x)
			);
		}
	}

	getConstellationName(short) {
		return this.linksJson[short]["name"];
	}

	/**
	 * Handler to hide links of constellations.
	 *
	 * @memberof SkySphere
	 */
	hideLinks() {
		for (let i = 0; i < this.constellationObjects.length; i++) {
			this.constellationObjects[i].hideLinks();
		}
		this.showLinks = false;
	}

	/**
	 * Display all constellations links.
	 * @memberof SkySphere
	 */
	showAllLinks() {
		for (let i = 0; i < this.constellationObjects.length; i++) {
			this.constellationObjects[i].showLinks();
		}
		this.showLinks = true;
	}

	/**
	 * Toggle links of constellations visibility.
	 * @memberof SkySphere
	 */
	toggleLinks() {
		if (this.showLinks) {
			this.hideLinks();
		} else {
			this.showAllLinks();
		}
	}

	/**
	 * Handler to hide names of constellations.
	 *
	 * @memberof SkySphere
	 */
	hideNames() {
		for (let i = 0; i < this.constellationObjects.length; i++) {
			this.constellationObjects[i].hideName();
		}
		this.showNames = false;
	}

	/**
	 * Handler to show names of constellations.
	 *
	 * @memberof SkySphere
	 */
	showAllNames() {
		for (let i = 0; i < this.constellationObjects.length; i++) {
			this.constellationObjects[i].showName();
		}
		this.showNames = true;
	}

	/**
	 * Toggle name of constellations visibility.
	 *
	 * @memberof SkySphere
	 */
	toggleNames() {
		if (this.showNames) {
			this.hideNames();
		} else {
			this.showAllNames();
		}
	}

	/**
	 * Handler to hide horizon.
	 *
	 * @memberof SkySphere
	 */
	hideHorizon() {
		this.horizon.hide();
		this.showHoriz = false;
	}

	/**
	 * Handler to show horizon.
	 *
	 * @memberof SkySphere
	 */
	showHorizon() {
		this.horizon.show();
		this.showHoriz = true;
	}

	/**
	 * Toggle horizon visibility.
	 *
	 * @memberof SkySphere
	 */
	toggleHoriz() {
		if (this.showHoriz) {
			this.hideHorizon();
		} else {
			this.showHorizon();
		}
	}

	disableControlWithOrientation() {
		this.controlWithOrientation = false;
		unselect('set-orien');
		let cameraRot = new THREE.Euler();
		cameraRot.setFromQuaternion(this.camera.quaternion, "YXZ");
		this.camera.lookAt(0, 0, -1);
		this.yawObject.rotation.y = cameraRot.y;
		this.pitchObject.rotation.x = cameraRot.x;
	}

	enableControlWithOrientation() {
		this.controlWithOrientation = true;
		select('set-orien');
		this.controls.update();
		this.yawObject.rotation.y = 0;
		this.pitchObject.rotation.x = 0;
	}

	toggleControlWithOrientation() {
		if (this.controlWithOrientation) {
			this.disableControlWithOrientation();
		} else {
			this.enableControlWithOrientation();
		}
	}

	updateTags() {
		let focused;
		let tagsDiv;
		if (this.visor.star !== undefined) {
			focused = this.visor.star;
			tagsDiv = document.getElementById('stars-tags');
			tagsDiv.innerHTML = '';
		}
		else if (this.visor.constellation !== undefined) {
			focused = this.visor.constellation;
			tagsDiv = document.getElementById('constellations-tags');
			tagsDiv.innerHTML = '';
		}
		else {
			return;
		}

		populateTags(focused.tags, tagsDiv);
	}

}
