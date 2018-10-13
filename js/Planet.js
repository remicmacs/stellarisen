class Planet {
	constructor(texture, distance, radius, tilt, name) {
		this.texture = texture;
		this.distance = distance;
		this.radius = radius;
		this.tilt = tilt;
		this.name = name

		console.log("Planet: constructor()");

		this.geometry = new THREE.SphereBufferGeometry(this.radius, 50, 50);
		let material = new THREE.MeshBasicMaterial(
			{	transparent: true
			,	color: '#ffffff'
			,	map: this.texture
			});
		this.mesh = new THREE.Mesh(this.geometry, material);
		this.mesh.position.z = -10;
		this.mesh.position.x = this.distance;
		this.mesh.rotation.reorder("ZYX");
		this.mesh.name = this.name;
		this.mesh.userData = { object: this };
		this.updateRotation();
	}

	addToScene(scene) {
		scene.add(this.mesh);
	}

	updateRotation(portrait) {
		let rotation = this.tilt +
			( portrait
			?	-Math.PI / 2
			:	0
			);

		let target = new THREE.Euler(0, 0, rotation);
		let current = this.mesh.rotation.clone();
		let tween = new TWEEN.Tween(current)
			.to(target, 1000)
			.easing(TWEEN.Easing.Bounce.Out);
		tween.onUpdate(() => {
			this.mesh.rotation.z = current.z;
		})
		tween.start();
	}
}
