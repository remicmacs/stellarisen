class Moon {
  constructor(texture, distance, radius, name, offset) {
    this.texture = texture;
    this.distance = distance;
    this.radius = radius;
    this.name = name;
    this.offset = offset;

    // Creating 3D geometry
    const geometry = new THREE.SphereBufferGeometry(this.radius, 50, 50);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: '#ffffff',
      map: this.texture
    });

    // Creating the mesh
    this.mesh = new THREE.Mesh(geometry, material);

    // Positionning the mesh
    this.mesh.position.y = this.offset.y + this.distance;
    this.mesh.position.x = this.offset.x;
    this.mesh.rotation.reorder("ZYX");

    // Binding instance to Mesh object
		this.mesh.name = this.name;
		this.mesh.userData = {
			object: this
		};
  }

  /**
	 * Update procedure
	 * Called on every frame, mainly used to update rotation of moons
	 */
	update() {
		this.mesh.rotation.y += 0.01;
	}
}
