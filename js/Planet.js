class Planet {
	constructor(texture, distance, radius, tilt, name) {
		this.texture = texture;
		this.distance = distance;
		this.radius = radius;
		this.tilt = tilt;
		this.name = name

		console.log("Planet: constructor()");

		let geometry = new THREE.SphereBufferGeometry(this.radius, 50, 50);
		let material = new THREE.MeshBasicMaterial(
			{	transparent: true
			,	color: '#ffffff'
			,	map: this.texture
			});
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.z = -10;
		this.mesh.position.x = this.distance;
		this.mesh.rotation.z = this.tilt + (viewportIsPortrait() ? -Math.PI / 2 : 0);
	}

	addToScene(scene) {
		scene.add(this.mesh);
	}
}
