class Planets {
	constructor(scene, camera, renderer, onLoad) {
		this.loaded = false;
		this.onLoad = onLoad;
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.depth = 0;

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		this.width = 16.285714285714285;

		this.target = null;

		let portrait = viewportIsPortrait();
		let ratio = utils.ratio;
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

		this.texturesObjects = new Array(10);
		this.rings = null;
		this.wasPortrait = viewportIsPortrait();

		console.log("Variables set");

		// Le LoadingManager va permettre d'interagir pendant le chargement de
		// gros fichiers et potentiellement d'afficher un loader
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onLoad = () => { this.addEverything(); };

		this.textureLoader = new THREE.TextureLoader(this.loadingManager);
		for (let index = 0; index < this.textures.length; index++) {
			this.textureLoader.load(this.textures[index], (texture) => { this.texturesObjects[index] = texture; })
		}

		window.addEventListener('resize', () => { this.rearrange(); });
	}

	rearrange() {
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		let ratio = utils.ratio;
		let portrait = viewportIsPortrait();

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

	addEverything() {
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

	update() {
		for (let i = 0; i < this.planets.length; i++) {
			this.planets[i].mesh.rotation.y += 0.01;
		}
	}

	lookAtAll() {
		this.target = null;
		let current =
			{	top: 		this.camera.top
			,	bottom: this.camera.bottom
			,	left: 	this.camera.left
			, right: 	this.camera.right
			,	x: 			this.camera.position.x
			, angle:	this.camera.rotation.z
			};

		if (this.depth == 1) {
			let portrait = viewportIsPortrait();
			let ratio = utils.ratio;

			let target =
				{	left:		-this.width * (portrait ? ratio : 1			)
				,	right:	this.width	* (portrait ? ratio : 1			)
				, top:		this.width	* (portrait ? 1 		: ratio	)
				, bottom:	-this.width * (portrait ? 1 		: ratio	)
				, x: 			0
				,	angle: 	portrait ? -Math.PI / 2 : 0
				};

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
			setPlaceholder("searchField", "Rechercher...");
			this.updateRotations(viewportIsPortrait());
			this.depth = 0;
		}
	}

	lookAtPlanet(planet) {
		if (planet == this.target) {
			return;
		}
		this.target = planet;
		planet.geometry.computeBoundingBox();
		let box = planet.geometry.boundingBox;

		let ratio = utils.ratio;
		let portrait = viewportIsPortrait();

		/*let max = box.max.x + (portrait ? 1 : 1);*/
		let max = 3 * box.max.x;
		let min = box.min.x;

		let current =
			{	top: 		this.camera.top
			,	bottom: this.camera.bottom
			,	left: 	this.camera.left
			, right: 	this.camera.right
			,	x: 			this.camera.position.x
			, angle:	this.camera.rotation.z
			};

		/* On sélectionne la cible finale du déplacement */
		let target =
			{	top:		max	/ (portrait ? ratio : 1			) - (portrait ? 0 : max / 3)
			,	bottom:	min	/ (portrait ? ratio : 1			) - (portrait ? 0 : max / 3)
			,	left:		min	/ (portrait ? 1 		: ratio	) - (portrait ? max / 3 : 0)
			, right:	max	/ (portrait ? 1 		: ratio	) - (portrait ? max / 3 : 0)
			, x: 			planet.mesh.position.x
			, angle:	(portrait ? 0 : -Math.PI / 2)
			};

		if (this.depth != 0) {
			let middle =
				{	left: 	-this.width	* (portrait ? ratio : 1			)
				,	right:	this.width	* (portrait ? ratio : 1			)
				,	top:		this.width	* (portrait ? 1 		: ratio	)
				,	bottom:	-this.width	* (portrait ? 1 		: ratio	)
				, x: 			(current.x + planet.mesh.position.x) / 2
				,	angle:	(portrait ? -Math.PI / 2 : 0)
				};

			let tweenToMiddle = new TWEEN.Tween(current)
				.to(middle, 1000)
				.easing(TWEEN.Easing.Cubic.InOut);

			let tweenToEnd = new TWEEN.Tween(middle)
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
			let tweenToEnd = new TWEEN.Tween(current)
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
		setPlaceholder("searchField", planet.name);
		this.updateRotations(!viewportIsPortrait());
	}

	updateRotations(portrait) {
		for (let index = 0; index < this.planets.length; index++) {
			this.planets[index].updateRotation(portrait);
		}
		this.updateRingsRotation(portrait);
	}

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

	onClick(event) {
		console.log("Planets: clicked");
		//event.preventDefault();
		/* On prépare et on lance un raycast */
		this.raycaster.setFromCamera(this.mouse, this.camera);
		let intersects = this.raycaster.intersectObjects(this.scene.children);

		if (intersects.length > 0) {
			let planetClicked = false;
			let objectIndex = 0;
			let hash = window.location.hash.substring(1);
			if (hash == intersects[0].object.userData.object.name + "-open") {
				window.history.back();
			}
			else if (hash == intersects[0].object.userData.object.name) {
				window.location.hash = "#" + intersects[0].object.userData.object.name + "-open";
				document.getElementById('planetName').innerHTML = intersects[0].object.userData.object.name;
			}
			else {
				window.location.hash = "#" + intersects[0].object.userData.object.name;
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
