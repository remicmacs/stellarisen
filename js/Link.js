class Link {
	constructor(firstRa, secondRa, firstDec, secondDec, constellationName) {
		let geometry = new THREE.Geometry();
		this.material = new THREE.LineBasicMaterial(
			{	color: 0x555555
			,	linewidth: 2
			,	transparent: true
			});

		let firstCoord = SkySphere.raDecToCartesian(100, firstRa, firstDec);
		let secondCoord = SkySphere.raDecToCartesian(100, secondRa, secondDec);
		geometry.vertices.push(firstCoord);
		geometry.vertices.push(secondCoord);

		this.line = new THREE.Line(geometry, this.material);
		this.line.name = constellationName;
		this.line.userData = { "type": "constellation" };
	}

	addToScene(scene) {
		scene.add(this.line);
	}
}
