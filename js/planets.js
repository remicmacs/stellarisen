/**
 * Planets
 * Object to manage the solar system scene
 * @class
 */
class Planets {
	/**
	 * Planets constructor
	 *
	 * Takes all objects necessary to build a scene
	 * @constructor
	 * @param {Scene} scene Scene object from Three.js library
	 * @param {Renderer} renderer Renderer object from Three.js library
	 * @param {function} onLoad Handler for Scene loading
	 */
	constructor(scene, renderer, onLoad) {
		this.loaded = false;
		this.onLoad = onLoad;
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.depth = 0;
		this.body = null;

		this.light = null;

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		this.width = 16.285714285714285; // WTF magic number ?

		this.target = null;

		// Instantiating Camera
		const portrait = viewportIsPortrait();
		const ratio = utils.ratio;
		this.camera = new THREE.OrthographicCamera
			(	-this.width * (portrait ? ratio : 1			)
			,	this.width	* (portrait ? ratio : 1			)
			,	this.width	* (portrait ? 1 		: ratio	)
			,	-this.width * (portrait ? 1 		: ratio	)
			,	-500
			,	1000
			);
		this.camera.rotation.z = (portrait ? -Math.PI / 2 : 0);

		this.planets = [];
		this.rings = null;
		this.wasPortrait = viewportIsPortrait();

		// Adds a loader for an animation during long loadings
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onLoad = () => { this.addEverything(); };

		// Loading textures
		this.texturesObjects = [];
		this.moonsTextures = [];
		this.textureLoader = new THREE.TextureLoader(this.loadingManager);

		this.textureLoader.load("res/images/planets/saturn_rings.png",
			(response) => { this.ringTexture = response; }
		);

		this.jsonLoader = new THREE.FileLoader(this.loadingManager);
		this.jsonLoader.load("res/planets.json", (response) => {
				this.json = JSON.parse(response);
				let planetJson;
				let moonJson;
				let moonIndex = 0;

				for (let index = 0; index < Object.keys(this.json).length; index++) {
					let planetName = Object.keys(this.json)[index];
					let planetJson = this.json[planetName];

					// On met les textures des planètes à charger
					this.textureLoader.load(
						planetJson["texture"],
						(texture) => { this.texturesObjects[index] = texture; }
					);

					for (moonJson in planetJson["moons"]) {

						// DIRTY HACK : ça force la fonction arrow à prendre la valeur courante de moonIndex plutôt que sa référence
						let m = moonIndex;

						// On met les textures des lunes à charger
						this.textureLoader.load(
							planetJson["moons"][moonJson]["texture"],
							(texture) => { this.moonsTextures[m] = texture; }
						)

						moonIndex++;
					}
				}
		});

		// Handles the resize event with custom method
		window.addEventListener('resize', () => { this.rearrange(); });
	}

	/**
	 * Handler for `resize` event
	 * Process the new viewport size to find ideal camera position
	 */
	rearrange() {
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		const ratio = utils.ratio;
		const portrait = viewportIsPortrait();

		// Calculating the optimal camera position
		this.camera.left =  	-this.width * (portrait ? ratio : 1			);
		this.camera.right = 	this.width	* (portrait ? ratio : 1			);
		this.camera.top = 		(this.width + (portrait ? 3 : 0))	* (portrait ? 1 		: ratio	);
		this.camera.bottom =	-this.width * (portrait ? 1 		: ratio	);
		this.camera.rotation.z = (portrait ? -Math.PI / 2 : 0);

		if (viewportIsPortrait() != this.wasPortrait) {
			this.updateRotations(viewportIsPortrait());
			this.wasPortrait = viewportIsPortrait();
		}

		this.camera.updateProjectionMatrix();
	}

	/**
	 * Function to add every object to the scene
	 */
	addEverything() {
		let moonsTexturesIndex = 0;

		// On crée les planètes
		for (let index = 0; index < Object.keys(this.json).length; index++) {
			let planetJson = this.json[Object.keys(this.json)[index]];
			let planet = new Planet
				(	this.texturesObjects[index]
				,	planetJson["distance"]
				,	planetJson["radius"]
				,	planetJson["tilt"]
				,	Object.keys(this.json)[index]
				);
			planet.addToScene(this.scene);
			this.planets.push(planet);

			// On passe à la planète suivante si la courante n'a pas de lunes
			if (typeof planetJson["moons"] === "undefined") {
				continue;
			}

			let moons = [];

			// On crée les lunes
			for (let moonIndex = 0; moonIndex < Object.keys(planetJson["moons"]).length; moonIndex++) {
				let moonJson = planetJson["moons"][Object.keys(planetJson["moons"])[moonIndex]];

				let moon = new Moon
					(	this.moonsTextures[moonsTexturesIndex]
					,	moonJson["distance"]
					, moonJson["radius"]
					, Object.keys(planetJson["moons"])[moonIndex]
					, planet.mesh.position
					);
				this.scene.add(moon.mesh);
				moons.push(moon);
				moonsTexturesIndex++;
			}

			planet.moons = moons;
		}

		this.scene.add(new THREE.AmbientLight(0x553333));
		this.light = new THREE.DirectionalLight(0xffffff, 1);
		this.light.position.copy(new THREE.Vector3(-24, 0, 10));
		this.scene.add(this.light);

		// Constructing rings for ringed planets
		let geometry = new THREE.RingBufferGeometry(1.8, 3.2, 64);

		// On arrange les UVs pour la texture
		let uvs = geometry.attributes.uv.array;
		for (let c = 0, j = 0; j <= 1; j ++ ) {
		    for ( var i = 0; i <= 64; i ++ ) {
						uvs[c++] = j;
		        uvs[c++] = i / 64;

		    }
		}

		let material = new THREE.MeshBasicMaterial(
			{	color: '#E1C9A2'
			,	side: THREE.DoubleSide
			, map: this.ringTexture
			, transparent: true
			, opacity: 1
			});

		this.rings = new THREE.Mesh(geometry, material);
		this.rings.position.z = -10;
		this.rings.position.x = 5.5;
		this.rings.rotation.reorder("ZYX");
		this.rings.rotation.y = Math.PI * 1.45;
		this.scene.add(this.rings);

		this.rearrange();
		this.updateRotations(viewportIsPortrait());
		this.loaded = true;
		this.onLoad();
	}

	/**
	 * Update procedure
	 * Called on every frame. Used to update planets/moons rotations and display
	 */
	update() {
		for (let index = 0; index < this.planets.length; index++) {
			this.planets[index].update();
    }
	}

	/**
	 * Update procedure for the planets rotations
	 * @param {boolean} portrait If the scene view is portrait or landscape
	 */
	updateRotations(portrait) {
		for (let index = 0; index < this.planets.length; index++) {
			this.planets[index].updateRotation(portrait);
			for (let moonIndex = 0; moonIndex < this.planets[index].moons.length; moonIndex++) {
				this.planets[index].moons[moonIndex].updateRotation(portrait);
			}
		}
		this.updateRingsRotation(portrait);
	}

	/**
	 * Update procedure for the rings
	 * @param {boolean} portrait If the scene view is portrait or landscape
	 */
	updateRingsRotation(portrait) {

		let rotation = -0.4660029 +
			(	portrait
			?	0
			: Math.PI / 2
			);

		let target = new THREE.Euler(0, 0, rotation);
		let current = this.rings.rotation.clone();
		let tween = new TWEEN.Tween(current)
			.to(target, 1000)
			.easing(TWEEN.Easing.Bounce.Out);
		tween.onUpdate(() => {
			this.rings.rotation.z = current.z;
		})
		tween.start();
	}

	/**
	 * Sets the view of the scene to show all solar system
	 */
	lookAtAll() {
		this.target = null;
		// Recover current position in scene
		const current =
			{	top: 		this.camera.top
			,	bottom: this.camera.bottom
			,	left: 	this.camera.left
			, right: 	this.camera.right
			,	x: 			this.camera.position.x
			, angle:	this.camera.rotation.z
			, lightx: 0
			, lighty: 24
			};

		if (this.depth == 1) {
			// On cache les lunes qui sont montrées (depht = 1, niveau des planètes)
			for (let index = 0; index < this.body.moons.length; index++) {
				this.body.moons[index].hide();
			}

			const portrait = viewportIsPortrait();
			const ratio = utils.ratio;

			// Set target camera position
			const target =
				{	left:		-this.width * (portrait ? ratio : 1			)
				,	right:	this.width	* (portrait ? ratio : 1			)
				, top:		this.width	* (portrait ? 1 		: ratio	)
				, bottom:	-this.width * (portrait ? 1 		: ratio	)
				, x: 			0
				,	angle: 	portrait ? -Math.PI / 2 : 0
				, lightx: -24
				, lighty: 0
				};

			// Create animation from current to target
			let tween = new TWEEN.Tween(current)
				.to(target, 1000)
				.easing(TWEEN.Easing.Cubic.InOut);

			tween.onUpdate(() => {
				this.camera.left 				= current.left;
				this.camera.right 			= current.right;
				this.camera.top 				= current.top;
				this.camera.bottom 			= current.bottom;
				this.camera.position.x	= current.x;
				this.camera.rotation.z	= current.angle;
				this.light.position.x = current.lightx;
				this.light.position.y = current.lighty;
				this.camera.updateProjectionMatrix();
			});

			tween.start();
			setPlaceholder("searchField", "Rechercher...");
			this.updateRotations(viewportIsPortrait());
			this.depth = 0;
		}
	}

	/**
	 * Sets the view of the scene focused on a specific planet
	 * @param {*} planet The planet to look at
	 */
	lookAtPlanet(planet) {
		if (planet == this.target) {
			return;
		}

		this.target = planet;
		planet.geometry.computeBoundingBox();
		const box = planet.geometry.boundingBox;

		const ratio = utils.ratio;
		const portrait = viewportIsPortrait();

		/*let max = box.max.x + (portrait ? 1 : 1);*/
		const max = 3 * box.max.x;
		const min = box.min.x;

		// Recover current camera position
		const current =
			{	top: 		this.camera.top
			,	bottom: this.camera.bottom
			,	left: 	this.camera.left
			, right: 	this.camera.right
			,	x: 			this.camera.position.x
			, angle:	this.camera.rotation.z
			, lightx: this.light.position.x
			, lighty: this.light.position.y
			};

		// Compute target camera position
		const target =
			{	top:		max	/ (portrait ? ratio : 1			) - (portrait ? 0 : max / 3)
			,	bottom:	min	/ (portrait ? ratio : 1			) - (portrait ? 0 : max / 3)
			,	left:		min	/ (portrait ? 1 		: ratio	) - (portrait ? max / 3 : 0)
			, right:	max	/ (portrait ? 1 		: ratio	) - (portrait ? max / 3 : 0)
			, x: 			planet.mesh.position.x
			, angle:	(portrait ? 0 : -Math.PI / 2)
			, lightx: 0
			, lighty: 24
			};

		// Computes the middle point for the animation
		if (this.depth != 0) {
			// On cache les lunes qui sont montrées (depht = 1, niveau des planètes)
			for (let index = 0; index < this.body.moons.length; index++) {
				this.body.moons[index].hide();
			}

			const middle =
				{	left: 	-this.width	* (portrait ? ratio : 1			)
				,	right:	this.width	* (portrait ? ratio : 1			)
				,	top:		this.width	* (portrait ? 1 		: ratio	)
				,	bottom:	-this.width	* (portrait ? 1 		: ratio	)
				, x: 			(current.x + planet.mesh.position.x) / 2
				,	angle:	(portrait ? -Math.PI / 2 : 0)
				, lightx: -24
				, lighty: 0
				};

			// Animation to the middle
			const tweenToMiddle = new TWEEN.Tween(current)
				.to(middle, 1000)
				.easing(TWEEN.Easing.Cubic.InOut);

			// Animation middle to end
			const tweenToEnd = new TWEEN.Tween(middle)
				.to(target, 1000)
				.easing(TWEEN.Easing.Cubic.InOut);

			tweenToEnd.onUpdate(() => {
				this.camera.left 				= middle.left;
				this.camera.right 			= middle.right;
				this.camera.top 				= middle.top;
				this.camera.bottom 			= middle.bottom;
				this.camera.position.x 	= middle.x;
				this.camera.rotation.z 	= middle.angle;
				this.light.position.x = middle.lightx;
				this.light.position.y = middle.lighty;
				this.camera.updateProjectionMatrix();
			});

			tweenToMiddle.onUpdate(() => {
				this.camera.left 				= current.left;
				this.camera.right 			= current.right;
				this.camera.top 				= current.top;
				this.camera.bottom 			= current.bottom;
				this.camera.position.x 	= current.x;
				this.camera.rotation.z 	= current.angle;
				this.light.position.x = current.lightx;
				this.light.position.y = current.lighty;
				this.camera.updateProjectionMatrix();
			});

			tweenToEnd.onComplete(() => {
				for (let index = 0; index < planet.moons.length; index++) {
					planet.moons[index].show();
				}
			});

			tweenToMiddle.chain(tweenToEnd);
			tweenToMiddle.start();
		}
		else if (this.depth == 0) {
			const tweenToEnd = new TWEEN.Tween(current)
				.to(target, 1000)
				.easing(TWEEN.Easing.Cubic.InOut);

			tweenToEnd.onUpdate(() => {
				this.camera.left 				= current.left;
				this.camera.right 			= current.right;
				this.camera.top 				= current.top;
				this.camera.bottom 			= current.bottom;
				this.camera.position.x 	= current.x;
				this.camera.rotation.z 	= current.angle;
				this.light.position.x = current.lightx;
				this.light.position.y = current.lighty;
				this.camera.updateProjectionMatrix();
			});

			tweenToEnd.onComplete(() => {
				for (let index = 0; index < planet.moons.length; index++) {
					planet.moons[index].show();
				}
			});

			tweenToEnd.start();
		}

		this.depth = 1;
		this.body = planet;
		setPlaceholder("searchField", planet.name);
		this.updateRotations(!viewportIsPortrait());
	}

	onClick(event) {
		/* On prépare et on lance un raycast */
		this.raycaster.setFromCamera(this.mouse, this.camera);
		const intersects = this.raycaster.intersectObjects(this.scene.children);

		if (intersects.length > 0) {

			const hash = window.location.hash.substring(1);

			//const objname = intersects[0].object.userData.object.name;
			const targetname = intersects[0].object.name;
			if (hash === targetname + "-open") {
				// If information panel is open, go back to focus
				window.history.back();
			} else if (hash === targetname) {
				// If target is already focused, open information panel
				window.location.hash = "#" + targetname + "-open";
				document.getElementById('planetName').innerHTML = targetname;
			} else {
				// If target has not been focused before, add hash
				window.location.hash = "#" + targetname;
			}
		}
	}

	onMove(event) {
		event.preventDefault();
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}

	onMouseDown(event) {
		//event.stopPropagation();
	}

	onMouseUp(event) {
		this.onClick(event);
	}

	onTouchStart(event) {
		this.mouse.x = event.touches[0].screenX;
		this.mouse.y = event.touches[0].screenY;
	}

	onTouchEnd(event) {
		this.onClick(event);
	}
}
