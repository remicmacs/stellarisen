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

		// Indicate whether everything has been loaded in the scene
		this.loaded = false;

		// Registering the constructor arguments
		this.onLoad = onLoad;
		this.scene = scene;
		this.renderer = renderer;

		// The depth is used to remember at which level (system, planet or moon) we
		// are so we can animate consequently
		this.depth = 0;

		// Will contains the focused solar object
		this.body = null;

		// Let's have some lighting
		this.light = null;

		// The raycaster is used for detecting the clicked element
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		// MAGIC NUMBER : it is actually the perfect half-width for looking
		// at the whole system
		this.width = 16.285714285714285;

		// Holds the object we want to focus on
		this.target = null;

		// Instantiating Camera
		const portrait = viewportIsPortrait();
		const ratio = utils.ratio;
		this.camera = new THREE.OrthographicCamera
			( -this.width * (portrait ? ratio : 1     )
			, this.width  * (portrait ? ratio : 1     )
			, this.width  * (portrait ? 1     : ratio )
			, -this.width * (portrait ? 1     : ratio )
			, 0
			, 1000
			);
		this.camera.rotation.z = (portrait ? -Math.PI / 2 : 0);

		// Instantiating the objects that will contain the planets and rings
		this.planets = [];
		this.rings = null;

		// Used to detect a change in device orientation
		this.wasPortrait = viewportIsPortrait();

		// Adds an asynchronous loader for big objects
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onLoad = () => { this.addEverything(); };

		// Instantiating the loader for the textures
		this.textureLoader = new THREE.TextureLoader(this.loadingManager);

		// Starting the rings texture's loading. On completion, we'll store
		// the texture
		this.textureLoader.load("res/images/planets/saturn_rings.png",
			(response) => { this.ringTexture = response; }
		);

		// Instantiating a file loader and starting it to load the planets
		// informations. On Jsoncompletion, it will load the planets, the moons, and
		// their textures
		this.jsonLoader = new THREE.FileLoader(this.loadingManager);
		this.jsonLoader.setResponseType("json");
		this.jsonLoader.load("res/planets_new.json", (response) => {
				this.json = response;

				// We loop through the planets
				const nbPlanets = Object.keys(this.json).length;
				for (let index = 0; index < nbPlanets; index++) {
					const planetName = Object.keys(this.json)[index];
					const planetJson = this.json[planetName];

					// We add the planet's texture for loading
					this.textureLoader.load(planetJson["texture"],
						(texture) => { planetJson["texture"] = texture; }
					);

					// If the planet has no moons, no can go to the next iteration
					if (typeof planetJson["moons"] === "undefined") {
						continue;
					}

					// We loop through the moons
					const nbMoons = Object.keys(planetJson["moons"]).length;
					for (let moonIndex = 0; moonIndex < nbMoons; moonIndex++) {
						const moonName = Object.keys(planetJson["moons"])[moonIndex];
						const moonJson = planetJson["moons"][moonName];

						// We add the moon's texture for loading
						this.textureLoader.load(moonJson["texture"],
							(texture) => { moonJson["texture"] = texture; }
						)
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

		// Update the viewport size
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		const ratio = utils.ratio;
		const portrait = viewportIsPortrait();

		// Update the position of the information modal dialog
		if (portrait) {
			setTop('planet-infos-wrapper');
			setTop('planet-infos');
		} else {
			setRight('planet-infos-wrapper');
			setRight('planet-infos');
		}

		// If we are at the solar system, we have no specific target so
		// we can set the camera to look at the whole scene
		if (this.depth === 0) {

			// Compute target camera position
			this.camera.top    = this.width	 * (portrait ? 1     : ratio);
			this.camera.bottom = -this.width * (portrait ? 1     : ratio);
			this.camera.left   = -this.width * (portrait ? ratio : 1    );
			this.camera.right  = this.width	 * (portrait ? ratio : 1    );
			this.camera.rotation.z = portrait ? -Math.PI / 2 : 0;

		} else {

			// Compute the bounding box of the targetted object
			this.target.geometry.computeBoundingBox();
			const max = 3 * this.target.geometry.boundingBox.max.x;
			const min = this.target.geometry.boundingBox.min.x;

			// Compute target camera position
			this.camera.top    =
			  max / (portrait ? ratio : 1    ) - (portrait ? 0       : max / 3);
			this.camera.bottom =
			  min / (portrait ? ratio : 1    ) - (portrait ? 0       : max / 3);
			this.camera.left   =
			  min / (portrait ? 1     : ratio) - (portrait ? max / 3 : 0      );
			this.camera.right  =
			  max / (portrait ? 1     : ratio) - (portrait ? max / 3 : 0      );

			// Compute target camera rotation
			if (this.depth === 1) {
				this.camera.rotation.z = (portrait ? -Math.PI     : -Math.PI / 2);
			} else {
				this.camera.rotation.z = (portrait ? -Math.PI / 2 : 0           );
			}
		}

		// If the orientation changed, we update the rotations
		if (portrait != this.wasPortrait) {
			this.updateRotations(portrait);
			this.wasPortrait = portrait;
		}

		// Update the projection matrix to see any change
		this.camera.updateProjectionMatrix();
	}

	/**
	 * Function to add every object to the scene
	 */
	addEverything() {

		// We loop through the planets to create them
		const nbPlanets = Object.keys(this.json).length;
		for (let index = 0; index < nbPlanets; index++) {
			const planetName = Object.keys(this.json)[index]
			const planetJson = this.json[planetName];

			// This is the data we want to display in the modal dialog
			let data =
				{	"mass": planetJson["mass"]
				, "diameter": planetJson["diameter"]
				, "gravity": planetJson["gravity"]
				, "daylength": planetJson["daylength"]
				, "yearlength": planetJson["yearlength"]
				, "aphelion": planetJson["aphelion"]
				, "perihelion": planetJson["perihelion"]
				, "meantemp": planetJson["meantemp"]
				};

			// We create the planet and add it to the scene
			const planet = new Planet
				(	planetJson["texture"]
				,	planetJson["distance"]
				,	planetJson["radius"]
				,	planetJson["tilt"]
				,	planetName
				, data
				);
			this.scene.add(planet.mesh);
			this.planets.push(planet);

			// We go to the next planet if this one doesn't have moons
			if (typeof planetJson["moons"] === "undefined") {
				continue;
			}

			// We loop through the moon and create them
			const nbMoons = Object.keys(planetJson["moons"]).length;
			for (let moonIndex = 0; moonIndex < nbMoons; moonIndex++) {
				const moonName = Object.keys(planetJson["moons"])[moonIndex];
				const moonJson = planetJson["moons"][moonName];

				// This is the data we want to display in the modal dialog
				data =
					{	"mass": moonJson["mass"]
					, "mass_exposant": moonJson["mass_exposant"]
					, "dimensions": moonJson["diameter"]
					};

				// We create the moon and add it to the scene
				const moon = new Moon
					(	moonJson["texture"]
					,	moonJson["distance"]
					, moonJson["radius"]
					, moonName
					, planet.mesh.position
					, moonJson["tilt"]
					, moonJson["retrograde"]
					, data
					);
				this.scene.add(moon.mesh);
				planet.moons.push(moon);
			}
		}

		// Setting the light with ambient and a directional light
		this.scene.add(new THREE.AmbientLight(0x553333));
		this.light = new THREE.DirectionalLight(0xffffff, 1);
		this.light.position.copy(new THREE.Vector3(-24, 0, 10));
		this.scene.add(this.light);

		// Constructing rings for ringed planets
		const geometry = new THREE.RingBufferGeometry(1.8, 3.2, 64);

		// We correct the UV for the rings texture
		let uvs = geometry.attributes.uv.array;
		for (let c = 0, j = 0; j <= 1; j ++ ) {
		    for (let i = 0; i <= 64; i ++) {
						uvs[c++] = j;
		        uvs[c++] = i / 64;
		    }
		}

		// Instantiating the material for the rings
		const material = new THREE.MeshBasicMaterial(
			{	color: '#E1C9A2'
			,	side: THREE.DoubleSide
			, map: this.ringTexture
			, transparent: true
			, opacity: 1
			});

		// Creating the rings, setting their position and adding it to the scene
		this.rings = new THREE.Mesh(geometry, material);
		this.rings.position.z = -10;
		this.rings.position.x = 5.5;
		this.rings.rotation.reorder("ZYX");
		this.rings.rotation.y = Math.PI * 1.45;
		this.scene.add(this.rings);

		// We signal the end of setting the scene and rearrange/update to take
		// device's orientation and viewport size in account
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
			this.planets[index].updateRotation(portrait, this.depth);
			for (let moonIndex = 0; moonIndex < this.planets[index].moons.length; moonIndex++) {
				this.planets[index].moons[moonIndex].updateRotation(portrait, this.depth);
			}
		}
		this.updateRingsRotation(portrait);
	}

	/**
	 * Update procedure for the rings
	 * @param {boolean} portrait If the scene view is portrait or landscape
	 */
	updateRingsRotation(portrait) {
		let rotation;
		if (this.depth === 0) {
			rotation = -0.4660029 + (portrait ? Math.PI : Math.PI / 2);
		} else if (this.depth === 1) {
			rotation = -0.4660029 + (portrait ? Math.PI / 2 : 0);
		} else if (this.depth === 2) {
			rotation = -0.4660029 + (portrait ? Math.PI : Math.PI / 2);
		} else {
			return;
		}

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
			, y:			this.camera.position.y
			, angle:	this.camera.rotation.z
			, lightx: 0
			, lighty: 24
			};

		if (this.depth != 0) {

			// We hide the visible moons (depht = 1, planet level)
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
				, y:			0
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
				this.camera.position.y	= current.y;
				this.camera.rotation.z	= current.angle;
				this.light.position.x		= current.lightx;
				this.light.position.y		= current.lighty;
				this.camera.updateProjectionMatrix();
			});

			tween.start();
			setPlaceholder("searchField", "Rechercher...");
			this.depth = 0;
			this.updateRotations(portrait);
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
			, y:			this.camera.position.y
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
			, y:			0
			, angle:	(portrait ? -Math.PI : -Math.PI / 2)
			, lightx: 0
			, lighty: 24
			};

		// Computes the middle point for the animation
		if (this.depth == 1) {
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
		else {
			const tweenToEnd = new TWEEN.Tween(current)
				.to(target, 1000)
				.easing(TWEEN.Easing.Cubic.InOut);

			tweenToEnd.onUpdate(() => {
				this.camera.left 				= current.left;
				this.camera.right 			= current.right;
				this.camera.top 				= current.top;
				this.camera.bottom 			= current.bottom;
				this.camera.position.x 	= current.x;
				this.camera.position.y	= current.y;
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
		setSpan('planetName', planet.name);
		setSpan('planet-mass', planet.mass);
		setSpan('planet-diameter', planet.diameter);
		setSpan('planet-gravity', planet.gravity);
		setSpan('planet-daylength', planet.daylength);
		setSpan('planet-yearlength', planet.yearlength);
		setSpan('planet-aphelion', planet.aphelion);
		setSpan('planet-perihelion', planet.perihelion);
		setSpan('planet-meantemp', planet.meantemp);
		this.updateTags();
		this.updateRotations(portrait);
	}

	/**
	 * Sets the view of the scene focused on a specific moon
	 * @param {*} planet The planet to look at
	 */
	lookAtMoon(moon) {
		if (moon == this.target) {
			return;
		}

		if (moon.isHidden()) {
			moon.show();
		}

		this.target = moon;
		moon.geometry.computeBoundingBox();
		const box = moon.geometry.boundingBox;

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
			, x:			this.camera.position.x
			,	y: 			this.camera.position.y
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
			, x:			moon.mesh.position.x
			, y: 			moon.distance
			, angle:	(portrait ? -Math.PI / 2 : 0)
			, lightx: -24
			, lighty: 0
			};

		const tweenToEnd = new TWEEN.Tween(current)
			.to(target, 1000)
			.easing(TWEEN.Easing.Cubic.InOut);

		tweenToEnd.onUpdate(() => {
			this.camera.left 				= current.left;
			this.camera.right 			= current.right;
			this.camera.top 				= current.top;
			this.camera.bottom 			= current.bottom;
			this.camera.position.x	= current.x;
			this.camera.position.y 	= current.y;
			this.camera.rotation.z 	= current.angle;
			this.light.position.x = current.lightx;
			this.light.position.y = current.lighty;
			this.camera.updateProjectionMatrix();
		});

		tweenToEnd.start();

		this.depth = 2;
		this.body = moon;
		setPlaceholder("searchField", moon.name);
		setSpan('moonName', moon.name);
		setSpan('moon-mass', moon.mass);
		setSpan('moon-mass-exposant', moon.mass_exposant);
		setSpan('moon-dimensions', moon.dimensions);
		this.updateTags();
		this.updateRotations(portrait);
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
			} else {
				// If target has not been focused before, add hash
				window.location.hash = "#" + targetname;
			}
		}
	}

	updateTags() {
		let tags;
		if (this.depth === 1) {
			tags = document.getElementById('planets-tags');
		} else if (this.depth === 2) {
			tags = document.getElementById('moons-tags');
		} else {
			return;
		}
		tags.innerHTML = '';

		for (let tag of this.target.tags) {
			const div = document.createElement('div');
			div.classList.add('tag');
			const text = document.createTextNode(tag);
			div.appendChild(text);
			tags.appendChild(div);

			// If the tag is the first tag (which should be the name of the current
			// object), we make it non-clickabe. Otherwise, it should lend to the
			// search for the same kind of objects
			if (tag === this.target.tags[0]) {
				div.classList.add('non-clickable');
			} else {
				div.classList.add('clickable');
				// Add here logic for searching objects of same type
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
