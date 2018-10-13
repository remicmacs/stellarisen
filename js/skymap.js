class SkySphere {
	constructor(scene, camera, renderer, onLoad) {
		this.loaded = false;
		this.onLoad = onLoad;
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;

		this.dragging = false;
		this.mousedown = false;

		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.set(0, 0, 0);
		this.camera.lookAt(0, 0, -1);

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
		this.starsObjects = [];
		this.visor = undefined;

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
		this.visorTexture = undefined;

		/* Chargement des étoiles */
		let starsFileLoader = new THREE.FileLoader(this.loadingManager);
		/* Chargement des constellations */
		let linksFileLoader = new THREE.FileLoader(this.loadingManager);
		/* Chargement du texte */
		let constellationFontLoader = new THREE.FontLoader(this.loadingManager);
		/* Chargement de la texture du skydome */
		let skydomeTextureLoader  = new THREE.TextureLoader(this.loadingManager);
		let visorTextureLoader = new THREE.TextureLoader(this.loadingManager);

		/* On lance tous les chargements */
		starsFileLoader.load('res/stars.json', (response) => { this.json = JSON.parse(response); });
		linksFileLoader.load("res/links.json", (response) => { this.linksJson = JSON.parse(response) });
		constellationFontLoader.load('fonts/helvetiker_regular.typeface.json', (font) => { this.constellationFont = font; });
		skydomeTextureLoader.load("res/images/milkyway.png", (texture) => { this.skydomeTexture = texture; });
		visorTextureLoader.load("res/images/visor.png", (texture) => { this.visorTexture = texture; });

		this.previousClosestStar = undefined;
		this.previousClosestStarScale = new THREE.Vector3();

		window.addEventListener('resize', this.rearrange);
	}


	update() {
		// Pas utilisé pour le moment, mais le delta de temps entre les frames peut être utile pour les animations
		let delta = this.clock.getDelta();

		if (this.deviceIsMobile) {
			this.controls.update();
		}

		let sphereRaycast = new THREE.Vector3();
		if (this.deviceIsMobile) {
			sphereRaycast.setFromSphericalCoords(-100, this.camera.rotation.x + Math.PI / 2, this.camera.rotation.y);
		}
		else {
			sphereRaycast.setFromSphericalCoords(-100, this.pitchObject.rotation.x + Math.PI / 2, this.yawObject.rotation.y);
			this.raycaster.setFromCamera(this.mouse, this.camera );
		}

		/* Mise à jour des noms des constellations :
		- Changement de transparence en fonction de la distance
		- Alignement avec la caméra */
		for (let i = 0; i < this.constellationObjects.length; i++) {
			let constellationName = this.constellationObjects[i].nameObject;

			/* On calcule une distance entre un raycast projeté sur la sphère de 100 unités et l'objet étudié */
			let distance = sphereRaycast.distanceTo(constellationName.position);
			this.constellationObjects[i].updateNames(distance, this.camera);
		}


		let minDistance = 100;
		let minDistanceObject = undefined;
		let distanceThreshold = 10;
		let angle = new THREE.Spherical();
		let projection = new THREE.Vector3();
		if (!this.deviceIsMobile) {
			/* On récupère le vecteur de magniture de la direction du raycaster
			qu'on transforme en coordonnées sphériques */
			angle.setFromCartesianCoords(
				this.raycaster.ray.direction.x,
				this.raycaster.ray.direction.y,
				this.raycaster.ray.direction.z
			);
			/* On récupère alors les angle phi et theta pour faire une projection
			sur la sphère */
			projection.setFromSphericalCoords(100, angle.phi, angle.theta);
		}

		/* On cherche l'objet le plus proche du curseur */
		for (let i = 0; i < this.starsObjects.length; i++) {
			let star = this.starsObjects[i];
			let distance = 100;

			// Weird comma-first notation, je sais pas si c'est comme ça qu'il
			// faudrait faire
			distance =
				(	this.deviceIsMobile
				?	sphereRaycast
				: projection
				)
				.distanceTo(star.position)
				;

			/* Si on est en dessous d'un seuil, on cherche le minimum */
			if (distance < distanceThreshold) {

				/* Recherche du minimum */
				if (distance < minDistance) {
					minDistance = distance;
					minDistanceObject = star;
				}
			}
		}

		/* Si on a trouvé une étoile proche, on déplace le curseur */
		if (minDistanceObject != undefined) {
			if (minDistanceObject != this.previousClosestStar) {
				this.visor.setTarget(minDistanceObject);
				console.log("Closest star: " + minDistanceObject.meshName);
			}
			this.previousClosestStar = minDistanceObject;
		}
		else {
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
		this.addStarsToScene();
		this.addConstellationsToScene();

		if (this.skydomeTexture != undefined) {
			this.addSkydomeToScene();
		}

		this.addHorizonToScene();
		this.addCardinalsToScene();

		this.visor = new Visor(this.visorTexture);
		this.visor.addToScene(this.scene);

		/* Garanti un temps minimum pour l'affichage du loading */
		while (this.loadingClock.getElapsedTime() < 1) {}

		/* Suppression de l'horloge de loading */
		this.loadingClock.stop();
		delete this.loadingClock;

		/* On recharge la taille du renderer et on update le pixel ratio
		(sinon ça s'affiche pas sur mon téléphone) */
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
  	this.camera.updateProjectionMatrix();

		this.loaded = true;
		this.onLoad();
	}


	/**
	 *	Add stars to the scene
	 */
	addStarsToScene() {
		let count = Object.keys(this.json).length;
		let geometry = new THREE.SphereBufferGeometry(0.75, 10, 10);

		// Et on dispose les étoiles conformément au JSON
		for (let i = 0; i < count; i++) {
			let line = this.json[Object.keys(this.json)[i]];
			let star = new Star
				(	line["ra"].valueOf()
				,	line["dec"].valueOf()
				,	line["mag"].valueOf()
				,	new THREE.Color().fromArray(line["colour"].split(" ").map(
						(x) => { return x / 255; })
					)
				,	line["proper"]
				,	geometry
				);

			star.addToScene(this.scene);
			this.starsObjects.push(star);
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
			constellation.addNameToScene(this.scene);
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

	rearrange() {
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}

	lookAtStar(star) {
		let angle = new THREE.Spherical();
		angle.setFromCartesianCoords(
			star.position.x,
			star.position.y,
			star.position.z
		);
		let current = { x: this.yawObject.rotation.y, y: this.pitchObject.rotation.x };
		let target = { x: angle.theta - Math.PI, y: Math.PI / 2 - angle.phi };

		let diffX = Math.abs(current.x - target.x);
		let diffY = Math.abs(current.y - target.y);
		let distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
		let max = Math.sqrt(2 * Math.pow(Math.PI, 2));
		let time = (distance / max) * 3000;

		let tween = new TWEEN.Tween(current)
			.to(target, time)
			.easing(TWEEN.Easing.Cubic.InOut);

		tween.onUpdate(() => {
			this.yawObject.rotation.y = current.x;
		 	this.pitchObject.rotation.x = current.y;
		});

		tween.start();
		this.visor.setTarget(star);
	}

	onMove(event) {
		event.preventDefault();
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		if (this.mousedown) {
			this.onDrag(event);
		}
	}

	onDrag(event) {
		this.dragging = true;
		this.yawObject.rotation.y += event.movementX * 0.01;
		this.pitchObject.rotation.x += event.movementY * 0.01;

		// On limite la rotation en X (on veut pas que la caméra puisse être à l'envers)
		this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
	}

	onClick(event) {
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
				/*if (intersects[i].object.userData["type"] == "star") {
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
				}*/
				if (intersects[i].object == this.visor.sprite) {
					let hash = window.location.hash.substring(1);
					window.location.hash = "#" + this.visor.star.meshName;
					let star = this.visor.star;

					let angle = new THREE.Spherical();
					angle.setFromCartesianCoords(
						star.position.x,
						star.position.y,
						star.position.z
					);
					let current = { x: this.yawObject.rotation.y, y: this.pitchObject.rotation.x };
					let target = { x: angle.theta - Math.PI, y: Math.PI / 2 - angle.phi };

					let diffX = Math.abs(current.x - target.x);
					let diffY = Math.abs(current.y - target.y);
					let distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
					let max = Math.sqrt(2 * Math.pow(Math.PI, 2));
					let time = (distance / max) * 3000;

					setTimeout(() => {
						window.location.hash = "#" + star.meshName + "-open";
					}, time);
					// enable('infos-wrapper');
					// enable('infos');

					let title = document.getElementById("objectName");
					title.innerHTML= this.visor.star.meshName;
					//alert(this.visor.star.meshName);
					//window.open("http://server7.wikisky.org/imgcut?survey=DSS2&w=256&h=256&angle=1.25&ra=" + this.visor.star.ra + "&de=" + this.visor.star.dec + "&output=PNG");
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

	onMouseDown() {
		this.mousedown = true;
	}

	onMouseUp(event) {
		if (!this.dragging) {
			this.onClick(event);
		}
		this.mousedown = false;
		this.dragging = false;
	}

	onTouchStart(event) {
		this.previousX = event.touches[0].screenX;
		this.previousY = event.touches[0].screenY;
		this.mouse.x = this.previousX;
		this.mouse.y = this.previousY;
	}

	onTouchEnd(event) {
		this.onClick(event);
	}

	onFingerDrag(event) {
		if (event.touches.length == 1) {
			this.dragging = true;
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

function polarRadianToCartesian(r, theta, phi) {
	let returned = [];
	returned[0] = r * Math.cos(phi) * Math.sin(theta);
	returned[1] = r * Math.sin(phi);
	returned[2] = r * Math.cos(phi) * Math.cos(theta);
	return returned;
}
