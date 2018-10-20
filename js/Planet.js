class Planet {
	constructor(texture, distance, radius, tilt, name) {
		this.texture = texture;
		this.distance = distance;
		this.radius = radius;
		this.tilt = tilt;
		this.name = name;

		this.moons = [];

		// Creating 3D geometry
		this.geometry = new THREE.SphereBufferGeometry(this.radius, 50, 50);
		const material = new THREE.MeshBasicMaterial({
			transparent: true,
			color: '#ffffff',
			map: this.texture
		});

		// Mapping texture
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

	addToScene(scene) {
		scene.add(this.mesh);
	}

	updateRotation(portrait) {
		const rotation = this.tilt +
			(portrait ?
				-Math.PI / 2 :
				0
			);

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
}