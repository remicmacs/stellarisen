/**
 * Planet
 * Geometry object to represent a planet
 * @class
 */
class Planet {
	/**
	 * Planet constructor
	 *
	 * Takes all things needed to make a planets
	 * @constructor
	 * @param {*} texture
	 * @param {real} distance Represents the distance to the Sun
	 * @param {real} radius Represents the radius of the planet
	 * @param {real} tilt Angle of the planet's tilt relative to the ecliptic
	 * @param {string} name Name of the planet
	 */
	constructor(texture, distance, radius, tilt, name, data) {
		this.texture = texture;
		this.distance = distance;
		this.radius = radius;
		this.tilt = tilt;
		this.name = name;

		this.mass = data.mass;
		this.diameter = data.diameter;
		this.gravity = data.gravity
		this.daylength = data.daylength;
		this.yearlength = data.yearlength;
		this.aphelion = data.aphelion;
		this.perihelion = data.perihelion;
		this.meantemp = data.meantemp;

		this.moons = [];

		// Creating 3D geometry
		this.geometry = new THREE.SphereBufferGeometry(this.radius, 50, 50);
		let material;
		if (this.name === "Soleil") {
			material = new THREE.MeshBasicMaterial({
				transparent: true,
				color: '#ffffff',
				map: this.texture//,
				//emissive: '#ffffff'
			});
		}
		else {
			material = new THREE.MeshLambertMaterial({
				transparent: true,
				color: '#ffffff',
				map: this.texture
			});
		}

		// Creating the mesh
		this.mesh = new THREE.Mesh(this.geometry, material);

		// Positionning object in scene
		this.mesh.position.z = -10;
		this.mesh.position.x = this.distance;
		this.mesh.rotation.reorder("ZYX");

		// Binding instance to Mesh object (why ?)
		this.mesh.name = this.name;
		this.mesh.userData = {
			object: this
		};
		this.updateRotation();
	}

	/**
	 * Adds the Planet to the given scene
	 * @param {*} scene The Planet object will be added to this Three.js scene
	 */
	addToScene(scene) {
		scene.add(this.mesh);
	}

	/**
	 * Update the rotation on a change in device orientation.
	 * Animates the bouncing planets
	 * @param {boolean} portrait Tell if the scene is portrait or landscape
	 */
	updateRotation(portrait, depth) {
		let rotation;
		if (depth === 0) {
			rotation = this.tilt + (portrait ? -Math.PI / 2 : 0);
		} else if (depth === 1) {
			rotation = this.tilt + (portrait ? -Math.PI : -Math.PI / 2);
		} else if (depth === 2) {
			rotation = this.tilt + (portrait ? -Math.PI / 2 : 0);
		} else {
			return;
		}

		// Creating an angle for the rotation
		const target = new THREE.Euler(0, 0, rotation);
		const current = this.mesh.rotation.clone();

		// Creating animation
		const tween = new TWEEN.Tween(current)
			.to(target, 1000)
			.easing(TWEEN.Easing.Bounce.Out);
		tween.onUpdate(() => {
			this.mesh.rotation.z = current.z;
		})
		tween.start(); // Launching animation
	}


	/**
	 * Update procedure
	 * Called on every frame, mainly used to update rotation of planets
	 */
	update() {
		for (let index = 0; index < this.moons.length; index++) {
			this.moons[index].update();
		}
		this.mesh.rotation.y -= 0.01;
	}
}
