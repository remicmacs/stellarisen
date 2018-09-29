class SkySphere {
	constructor(scene, camera, renderer) {
		console.log("Skyphere: constructor()");
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;

		/* Avec le startTime, on va s'assurer que le chargement s'affiche au moins pendant un temps donné */
		this.loadingClock = new THREE.Clock();
		this.loadingClock.start();
		this.clock = new THREE.Clock(true);
		this.mouse = new THREE.Vector2();

		// Le LoadingManager va permettre d'interagir pendant le chargement de gros fichiers
		// et potentiellement d'afficher un loader
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onProgress = this.onProgress;
		this.loadingManager.onLoad = () => { this.addEverything(); };

		this.constellationObjects = [];

		this.deviceIsMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);

		// La caméra est incluse dans un objet qui sera utilisé pour le contrôle du pitch (haut/bas)
		// Cet objet est lui-même inclus dans le contrôle du yaw (gauche/droite)
		// Cela permet de faire des rotations style FPS (on détache les repères)
		this.pitchObject = new THREE.Object3D();
		this.yawObject = new THREE.Object3D();
		this.pitchObject.add(this.camera);
		this.yawObject.add(this.pitchObject);
		this.scene.add(this.yawObject);

		if (this.deviceIsMobile) {
			this.controls = new THREE.DeviceOrientationControls(this.camera);
		}

		// On met en place le renderer
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		//var mouse = new THREE.Vector2(), INTERSECTED;
		this.raycaster = new THREE.Raycaster();

		this.json = {};
		this.linksJson = {};
		this.constellationFont = undefined;
		this.skydomeTexture = undefined;

		/* Chargement des étoiles */
		let starsFileLoader = new THREE.FileLoader(this.loadingManager);
		/* Chargement des constellations */
		let linksFileLoader = new THREE.FileLoader(this.loadingManager);
		/* Chargement du texte */
		let constellationFontLoader = new THREE.FontLoader(this.loadingManager);
		/* Chargement de la texture du skydome */
		let skydomeTextureLoader  = new THREE.TextureLoader(this.loadingManager);

		/* On lance tous les chargements */
		starsFileLoader.load('res/stars.json', (response) => { this.json = JSON.parse(response); });
		linksFileLoader.load("res/links.json", (response) => { this.linksJson = JSON.parse(response) });
		constellationFontLoader.load('fonts/helvetiker_regular.typeface.json', (font) => { this.constellationFont = font; });
		skydomeTextureLoader.load("res/images/milkyway.png", (texture) => { this.skydomeTexture = texture; });

		document.addEventListener('mousemove', (event) => {
			event.preventDefault();
			this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}, false);

		document.onclick = (event) => {
			// find intersections
			this.raycaster.setFromCamera(this.mouse, this.camera );
			let intersects = this.raycaster.intersectObjects(this.scene.children);
			if (intersects.length > 0) {
				//if ( INTERSECTED != intersects[ 0 ].object ) {
					/**if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
					INTERSECTED = intersects[ 0 ].object;
					INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
					INTERSECTED.material.emissive.setHex( 0xff0000 );**/
				//	console.log("Intersected !");
				//	alert(intersects[ 0 ].object.name);
				//}
				let starClicked = false;
				let constellationClicked = false;
				let objectIndex = 0;

				for (let i = 0; i < intersects.length; i++) {
					if (intersects[i].object.userData["type"] == "star") {
						objectIndex = i;
						starClicked = true;
						console.log("Star clicked !");
						break;
					}
					else if (intersects[i].object.userData["type"] == "constellation") {
						objectIndex = i;
						constellationClicked = true;
						console.log("Constellation clicked !");
						break;
					}
				}

				if (starClicked || constellationClicked) {
					alert(intersects[objectIndex].object.name);
				}
				else {
					//alert(intersects[ 0 ].object.name);
				}

			} else {
				//if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
				INTERSECTED = null;
			}
		}

		// Lorsqu'on appuie sur la souris, on bind la fonction onMouseDrag au mouvement de la souris
		document.onmousedown = (event) => {
			//document.onmousemove = onMouseDrag;
			document.onmousemove = (event) => {
				this.yawObject.rotation.y += event.movementX * 0.01;
				this.pitchObject.rotation.x += event.movementY * 0.01;

				// On limite la rotation en X (on veut pas que la caméra puisse être à l'envers)
				this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
			}
		}

		// Lorsqu'on pose le doigt, on bind la fonction onMouseDrag au mouvement du doigt
		document.ontouchstart = (event) => {
			this.previousX = event.touches[0].screenX;
			this.previousY = event.touches[0].screenY;
			this.mouse.x = this.previousX;
			this.mouse.y = this.previousY;
			//document.ontouchmove = onFingerDrag;
			document.ontouchmove = (event) => {
				if (event.touches.length == 1) {
					var deltaX = this.previousX - event.touches[0].screenX;
					var deltaY = this.previousY - event.touches[0].screenY;
					this.previousX = event.touches[0].screenX;
					this.previousY = event.touches[0].screenY;
					this.yawObject.rotation.y += -deltaX * 0.002;
					this.pitchObject.rotation.x += -deltaY * 0.002;

					// On limite la rotation en X (on veut pas que la caméra puisse être à l'envers)
					this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
				}	
			}
		}

		// Lorsqu'on relâche la souris, on unbind
		document.onmouseup = function(event) {
			document.onmousemove = null;			
		}

		// Lorsqu'on relâche le doigt, on unbind
		document.ontouchend = function(event) {
			document.ontouchmove = null;			
		}
	}


	update() {
		// Pas utilisé pour le moment, mais le delta de temps entre les frames peut être utile pour les animations
		let delta = this.clock.getDelta();

		if (this.deviceIsMobile) {
			this.controls.update();
		}

		let sphereRaycast = undefined;
		if (this.deviceIsMobile) {
			sphereRaycast = polarRadianToCartesian(-100, this.camera.rotation.y, -this.camera.rotation.x);
		}
		else {
			sphereRaycast = polarRadianToCartesian(-100, this.yawObject.rotation.y, -this.pitchObject.rotation.x);
		}

		for (let i = 0; i < this.constellationObjects.length; i++) {
			let constellationName = this.constellationObjects[i].nameObject;

			/* On calcule une distance entre un raycast projeté sur la sphère de 100 unités et l'objet étudié */
			let distance = new THREE.Vector3().fromArray(sphereRaycast).distanceTo(constellationName.position);

			/* Au dessus de 100 unités, on cache l'objet */
			if (distance > 100 && constellationName.visible) {
				constellationName.visible = false;					
			}
			/* En dessous de 100 unités, on montre l'objet */
			else if (distance < 100 && !constellationName.visible) {
				constellationName.visible = true;
			}

			/* En dessous de 100 unités, on change l'opacité de l'objet */ 
			if (distance < 100) {
				/* En dessous de 50 unités, l'objet est totalement visible */
				if (distance < 50) {
					constellationName.material.opacity = 1;
				}
				/* Entre 50 et 100 unités, son opacité dépend de sa distance */
				else {
					constellationName.material.opacity = 1 - ((distance - 50) / 50);
				}					
			}
		
			/* On force les textes à toujours être alignés avec la caméra */
			this.camera.getWorldQuaternion(constellationName.quaternion);
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
		this.addStarsToScene();
		this.addConstellationsToScene();

		if (this.skydomeTexture != undefined) {
			this.addSkydomeToScene();
		}

		this.addHorizonToScene();
		this.addCardinalsToScene();

		/* Garanti un temps minimum pour l'affichage du loading */
		while (this.loadingClock.getElapsedTime() < 1) {}

		/* Suppression de l'horloge de loading */
		this.loadingClock.stop();
		delete this.loadingClock;

		/* Activation de l'animation de fade-out du loading */
		const loadingScreen = document.getElementById( 'loader-wrapper' );
		loadingScreen.classList.add( 'fade-out' );

		/* On recharge la taille du renderer et on update le pixel ratio
		(sinon ça s'affiche pas sur mon téléphone) */
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
  		this.camera.updateProjectionMatrix();
	}


	/**
	 *	Add stars to the scene
	 */
	addStarsToScene() {
		let count = Object.keys(this.json).length;

		// Et on dispose les étoiles conformément au JSON
		for (let i = 0; i < count; i++) {
			let line = this.json[Object.keys(this.json)[i]];
			let star = new Star(
				line["ra"].valueOf(),
				line["dec"].valueOf(),
				line["mag"].valueOf(),
				new THREE.Color().fromArray(line["colour"].split(" ").map((x) => { return x / 255; })),
				line["proper"]
			);

			//this.scene.add(star.mesh);
			star.addToScene(this.scene);
		}
	}


	/**
	 *	Add constellations to the scene
	 */
	addConstellationsToScene() {
		let constellationCount = Object.keys(this.linksJson).length;

		for (let i = 0; i < constellationCount; i++) {
			let constellationName = Object.keys(this.linksJson)[i];
			let constellationJson = this.linksJson[constellationName];
			let constellationFullName = constellationJson["name"];
			let links = constellationJson["links"];
			let constellation = new Constellation(
				constellationJson["ra_barycenter"],
				constellationJson["dec_barycenter"],
				constellationFullName,
				links,
				this.json
			);
			constellation.addToScene(this.scene);
			constellation.generateName(this.constellationFont);
			//constellation.addNameToScene(this.scene);
			this.constellationObjects.push(constellation);
		}
	}

	
	/**
	 *	Add skydome to the scene
	 */
	addSkydomeToScene() {
		let skyGeo = new THREE.SphereGeometry(150, 25, 25);
		let material = new THREE.MeshBasicMaterial(
			{	map: this.skydomeTexture
			,	transparent: true
			});
		let sky = new THREE.Mesh(skyGeo, material);
		sky.material.side = THREE.BackSide;
		sky.material.opacity = 0.3;
		this.scene.add(sky);
	}


	/**
	 *	Add horizon to the scene
	 */
	addHorizonToScene() {
		let geometry = new THREE.CircleGeometry( 110, 64 );
		/* Enlever le dernier vertex permet de ne pas compléter la figure et de ne pas obtenir une surface */
		geometry.vertices.shift();

		let material = new THREE.LineBasicMaterial( { color: 0x000050, linewidth: 3 } );
		let circle = new THREE.LineLoop(geometry, material);
		circle.rotation.x = Math.PI / 2;
		circle.rotation.y = 0;
		circle.rotation.z = 0;
		circle.position.y = 0.5;
		this.scene.add(circle);

		material = new THREE.LineBasicMaterial( { color: 0x500000, linewidth: 3 } );
		circle = new THREE.LineLoop(geometry, material);
		circle.rotation.x = Math.PI / 2;
		circle.rotation.y = 0;
		circle.rotation.z = 0;
		circle.position.y = -0.5;
		this.scene.add(circle);
	}


	/**
	 *	Add cardinals points to the scene
	 */
	addCardinalsToScene() {
		let options = { font: this.constellationFont, size: 5, height: 1, curveSegments: 12, bevelEnabled: false };
		let cardinals = [ "N", "S", "E", "W" ];
		let cardinalsAngles = [ 0, Math.PI, -Math.PI / 2, Math.PI / 2 ];
		let cardinalsPositions =
			[	new THREE.Vector3(0, 4, -110)
			,	new THREE.Vector3(0, 4, 110)
			,	new THREE.Vector3(110, 4, 0)
			,	new THREE.Vector3(-110, 4, 0)
			];
		for (let i = 0; i < cardinals.length; i++) {
			let geometry = new THREE.TextGeometry(cardinals[i], options);
			geometry.center();
			let material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
			let mesh = new THREE.Mesh(geometry, material);
			mesh.position.copy(cardinalsPositions[i]);
			/*mesh.position.x = cardinalsPositions[i].x;
			mesh.position.y = cardinalsPositions[i].y;
			mesh.position.z = cardinalsPositions[i].z;*/
			mesh.rotation.y = cardinalsAngles[i];
			this.scene.add(mesh);
		}
	}


	static raDecToCartesian(r, ra, dec) {
		/* La transformation de RA/DEC vers un repêre cartésien en passant par un repêre sphérique nécessite
		de transformer les valeurs, le passage de coordonnées sphériques à des coordonnées cartésiennes de Three.js
		utilisant les coordonnées sphériques classiques (voir https://threejs.org/docs/#api/en/math/Spherical)
		alors que RA/DEC ne place pas les angles aux mêmes endroits.
		RA va de 0 à 24, il faut donc le multiplier par 360 / 24 (= 15).
		DEC ne s'incrémente pas dans le même sens ni depuis le même axe, il faut utiliser la valeur négative
		à laquelle on ajoute 90° */
		let coord = new THREE.Vector3().setFromSphericalCoords(
			r, 
			THREE.Math.degToRad(-dec + 90),
			THREE.Math.degToRad(ra * 15)
		);
		return coord;
	}
}

function polarRadianToCartesian(r, theta, phi) {
	let returned = [];
	returned[0] = r * Math.cos(phi) * Math.sin(theta);
	returned[1] = r * Math.sin(phi);
	returned[2] = r * Math.cos(phi) * Math.cos(theta);
	return returned;
}

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
