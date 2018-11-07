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
	 * @param {Camera} camera Camera object from Three.js library
	 * @param {Renderer} renderer Renderer object from Three.js library
	 * @param {function} onLoad Handler for Scene loading
	 */
	constructor(scene, camera, renderer, onLoad) {
		this.loaded = false;
		this.onLoad = onLoad;
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.depth = 0;

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		this.width = 16.285714285714285; // WTF magic number ?

		this.target = null;

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

		// On met en place le renderer
		/*this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);*/

		this.planets = [];

		this.textures =
			[	"res/images/planets/sun.png"
			,	"res/images/planets/mercury.png"
			,	"res/images/planets/venus.png"
			,	"res/images/planets/earth.png"
			,	"res/images/planets/mars.png"
			,	"res/images/planets/jupiter.png"
			,	"res/images/planets/saturn.png"
			,	"res/images/planets/uranus.png"
			,	"res/images/planets/neptune.png"
			,	"res/images/planets/pluto.png"
			]

		this.distances =
			[	-24
			,	-13
			,	-9
			,	-6.7
			,	-4.7
			,	1.5
			,	5.5
			,	9
			,	12
			,	14
			]

		this.radius =
			[	10
			,	0.38555
			,	0.95623
			,	1.00672
			,	0.5357
			,	1.6
			,	1.4
			,	1.1
			,	1.1
			,	0.18744
			]

		this.tilts =
			[	-0.1265364		// Soleil
			,	-0.0005235988	// Mercure
			,	-0.04607669		// Venus
			,	-0.408407		// Terre
			,	-0.43964844		// Mars
			,	-0.05462881 	// Jupiter
			,	-0.4660029		// Saturne
			,	-1.4351842		// Uranus
			,	-0.49427724		// Neptune
			,	-1.0030407		// Pluto
			]

		this.names =
			[	"Soleil"
			,	"Mercure"
			,	"Venus"
			,	"Terre"
			,	"Mars"
			,	"Jupiter"
			,	"Saturne"
			,	"Uranus"
			,	"Neptune"
			,	"Pluton"
			]

		this.rings = null;

		this.wasPortrait = viewportIsPortrait();

		console.log("Variables set");

		// Adds a loader for an animation during long loadings
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onLoad = () => { this.addEverything(); };

		// Loading textures
		this.texturesObjects = new Array(10);
		this.textureLoader = new THREE.TextureLoader(this.loadingManager);
		for (let index = 0; index < this.textures.length; index++) {
			this.textureLoader.load(
				this.textures[index], 
				(texture) => { this.texturesObjects[index] = texture; }
				);
		}

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
		// Adding planets to scene
		for (let index = 0; index < this.textures.length; index++) {
			let planet = new Planet
				(	this.texturesObjects[index]
				,	this.distances[index]
				,	this.radius[index]
				,	this.tilts[index]
				,	this.names[index]
				);
			planet.addToScene(this.scene);
			this.planets.push(planet);
		}

		// Constructing rings for ringed planets
		let geometry = new THREE.RingBufferGeometry(2.2, 3.2, 25);
		let material = new THREE.MeshBasicMaterial(
			{	color: '#E1C9A2'
			,	side: THREE.DoubleSide
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
	 * Defines the frames of animations for the scene
	 */
	update() {
		for (let i = 0; i < this.planets.length; i++) {
			this.planets[i].mesh.rotation.y += 0.01;
    }
	}

	/**
	 * Update procedure for the planets rotations
	 * @param {boolean} portrait If the scene view is portrait or landscape
	 */
	updateRotations(portrait) {
		for (let index = 0; index < this.planets.length; index++) {
			this.planets[index].updateRotation(portrait);
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
			};

		if (this.depth == 1) {
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
				this.camera.updateProjectionMatrix();
			});

			tween.start();
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
			};

		// Compute target camera position
		const target =
			{	top:		max	/ (portrait ? ratio : 1			) - (portrait ? 0 : max / 3)
			,	bottom:	min	/ (portrait ? ratio : 1			) - (portrait ? 0 : max / 3)
			,	left:		min	/ (portrait ? 1 		: ratio	) - (portrait ? max / 3 : 0)
			, right:	max	/ (portrait ? 1 		: ratio	) - (portrait ? max / 3 : 0)
			, x: 			planet.mesh.position.x
			, angle:	(portrait ? 0 : -Math.PI / 2)
			};

		// Computes the middle point for the animation
		if (this.depth != 0) {
			const middle =
				{	left: 	-this.width	* (portrait ? ratio : 1			)
				,	right:	this.width	* (portrait ? ratio : 1			)
				,	top:		this.width	* (portrait ? 1 		: ratio	)
				,	bottom:	-this.width	* (portrait ? 1 		: ratio	)
				, x: 			(current.x + planet.mesh.position.x) / 2
				,	angle:	(portrait ? -Math.PI / 2 : 0)
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
				this.camera.updateProjectionMatrix();
			});

			tweenToMiddle.onUpdate(() => {
				this.camera.left 				= current.left;
				this.camera.right 			= current.right;
				this.camera.top 				= current.top;
				this.camera.bottom 			= current.bottom;
				this.camera.position.x 	= current.x;
				this.camera.rotation.z 	= current.angle;
				this.camera.updateProjectionMatrix();
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
				this.camera.updateProjectionMatrix();
			});

			tweenToEnd.start();
		}

		this.depth = 1;
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
