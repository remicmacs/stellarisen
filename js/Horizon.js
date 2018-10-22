class Horizon {
  constructor(font) {
    this.root = new THREE.Object3D();
    this.cardinalPoints = [];
    this.circles = [];

    let geometry = new THREE.CircleGeometry(110, 64);
		/* Enlever le dernier vertex permet de ne pas compléter la figure et de ne pas obtenir une surface */
		geometry.vertices.shift();

		let material;
		material = new THREE.LineBasicMaterial({ color: 0x000050, linewidth: 3 });
		let circle = new THREE.LineLoop(geometry, material);
		circle.rotation.x = Math.PI / 2;
		circle.rotation.y = 0;
		circle.rotation.z = 0;
		circle.position.y = 0.5;
    this.circles.push(circle);
    this.root.add(circle);

		material = new THREE.LineBasicMaterial({ color: 0x500000, linewidth: 3 });
		circle = new THREE.LineLoop(geometry, material);
		circle.rotation.x = Math.PI / 2;
		circle.rotation.y = 0;
		circle.rotation.z = 0;
		circle.position.y = -0.5;
    this.circles.push(circle);
    this.root.add(circle);

    let options =
      { font          : font
      , size          : 5
      , height        : 1
      , curveSegments : 12
      , bevelEnabled  : false
      };
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
			this.root.add(mesh);
      this.cardinalPoints.push(mesh);
		}
  }

  addToScene(scene) {
    scene.add(this.root);
  }

  hide() {
    for (let i = 0; i < this.root.children.length; i++) {
      this.root.children[i].visible = false;
    }
  }

  show() {
    for (let i = 0; i < this.root.children.length; i++) {
      this.root.children[i].visible = true;
    }
  }
}
