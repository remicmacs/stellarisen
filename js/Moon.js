class Moon {
  constructor(texture, distance, radius, name, offset, tilt, retrograde, data) {
    this.texture = texture;
    this.distance = distance;
    this.radius = radius;
    this.name = name;
    this.offset = offset;
    this.tilt = -THREE.Math.degToRad(tilt);
    this.retrograde = retrograde;
    this.hidden = true;

    this.mass = data.mass;
    this.mass_exposant = data.mass_exposant
    this.dimensions = data.dimensions;

    this.tags = [];

    // Creating 3D geometry
    this.geometry = new THREE.SphereBufferGeometry(this.radius, 50, 50);
    const material = new THREE.MeshLambertMaterial({
      transparent: true,
      color: '#ffffff',
      map: this.texture
    });

    // Creating the mesh
    this.mesh = new THREE.Mesh(this.geometry, material);

    // Positionning the mesh
    //this.mesh.position.y = this.offset.y + this.distance;
    this.mesh.position.y = 0;
    this.mesh.position.x = this.offset.x;
    this.mesh.position.z = -10;
    this.mesh.rotation.reorder("ZYX");

    // Binding instance to Mesh object
		this.mesh.name = this.name;
		this.mesh.userData = {
			object: this
		};

    this.tags.push(this.name);
    this.tags.push("Lune");
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
	 * Called on every frame, mainly used to update rotation of moons
	 */
	update() {
		this.mesh.rotation.y -= 0.01 * (this.retrograde ? -1 : 1);
	}

  show() {
    let current = { x: this.mesh.position.y };
    let target = { x: this.distance };
    const tween = new TWEEN.Tween(current)
      .to(target, 1000)
      .easing(TWEEN.Easing.Cubic.InOut);
    tween.onUpdate(() => {
      this.mesh.position.y = current.x;
    });
    tween.onComplete(() => {
      this.hidden = false;
    });
    tween.start();
  }

  hide() {
    let current = { x: this.mesh.position.y };
    let target = { x: 0};
    const tween = new TWEEN.Tween(current)
      .to(target, 1000)
      .easing(TWEEN.Easing.Cubic.InOut);
    tween.onUpdate(() => {
      this.mesh.position.y = current.x;
    });
    tween.onComplete(() => {
      this.hidden = true;
    });
    tween.start();
  }

  isHidden() {
    return this.hidden;
  }
}
