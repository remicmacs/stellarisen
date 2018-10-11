class Planets {
	constructor(scene, camera, renderer, onLoad) {
		this.loaded = false;
		this.onLoad = onLoad;
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;

		console.log("Planets: constructor()");

		if (viewportIsPortrait()) {
			let ratio = window.innerWidth / window.innerHeight;
			this.camera = new THREE.OrthographicCamera
				(	-16.285714285714285 * ratio
				,	16.285714285714285 * ratio
				,	16.285714285714285
				,	-16.285714285714285
				,	-500
				,	1000
				);
			this.camera.rotation.z = -Math.PI / 2;
		}
		else {
			let ratio = window.innerHeight / window.innerWidth;
			this.camera = new THREE.OrthographicCamera
				(	-16.285714285714285
				,	16.285714285714285
				,	16.285714285714285 * ratio
				,	-16.285714285714285 * ratio
				,	-500
				,	1000
				);
		}

		// On met en place le renderer
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		console.log("Renderer set");

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

		// Le LoadingManager va permettre d'interagir pendant le chargement de gros fichiers
		// et potentiellement d'afficher un loader
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
		if (viewportIsPortrait()) {
			let ratio = window.innerWidth / window.innerHeight;
			this.camera.left =  -16.285714285714285 * ratio;
			this.camera.right = 16.285714285714285 * ratio;
			this.camera.top = 16.285714285714285;
			this.camera.bottom = -16.285714285714285;
			this.camera.rotation.z = -Math.PI / 2;
		}
		else {
			console.log("Going in there");
			let ratio = window.innerHeight / window.innerWidth;
			this.camera.left =  -16.285714285714285;
			this.camera.right = 16.285714285714285;
			this.camera.top = 16.285714285714285 * ratio;
			this.camera.bottom = -16.285714285714285 * ratio;
			this.camera.rotation.z = 0;
		}

		console.log(viewportIsPortrait() == this.wasPortrait);
		if (viewportIsPortrait() != this.wasPortrait) {
			for (let index = 0; index < this.planets.length; index++) {
				this.planets[index].mesh.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), (viewportIsPortrait() ? -Math.PI / 2 : Math.PI / 2));
			}
			this.rings.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), (viewportIsPortrait() ? -Math.PI / 2 : Math.PI / 2));
			this.wasPortrait = viewportIsPortrait();
		}

		this.camera.updateProjectionMatrix();
	}

	addEverything() {
		console.log("Loaded");
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
		this.rings.rotation.y = Math.PI * 1.45;
		this.rings.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), 0.4660029 * 2.33 + (viewportIsPortrait() ? -Math.PI / 2 : 0));
		this.scene.add(this.rings);

		/* Activation de l'animation de fade-out du loading */
		//const loadingScreen = document.getElementById( 'loader-wrapper' );
		//loadingScreen.classList.add( 'fade-out' );
		this.loaded = true;
		this.onLoad();
	}

	update() {
		for (let i = 0; i < this.planets.length; i++) {
			this.planets[i].mesh.rotateY(0.01);
		}
	}
}
