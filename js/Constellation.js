class Constellation {
	constructor(ra, dec, fullName, links, stars) {
		this.ra = ra;
		this.dec = dec;
		this.fullName = fullName;
		this.links = [];

		let constellationLinks =
			{	"ra": this.ra
			,	"dec": this.dec
			,	"lines": []
			};

		for (let j = 0; j < links.length; j++) {
			let link = new Link
				( stars[links[j][0]]["ra"].valueOf()
				,	stars[links[j][1]]["ra"].valueOf()
				,	stars[links[j][0]]["dec"].valueOf()
				,	stars[links[j][1]]["dec"].valueOf()
				,	fullName
				);
			this.links.push(link);
		}
	}

	addToScene(scene) {
		for (let i = 0; i < this.links.length; i++) {
			this.links[i].addToScene(scene);
		}
	}

	generateName(font) {
		let options = { font: font, size: 2.5, height: 0.1, curveSegments: 12, bevelEnabled: false };

		let material = new THREE.MeshBasicMaterial(
			{	color: 0xffffff
			,	transparent: true
			});
		let geometry = new THREE.TextBufferGeometry(this.fullName, options);
		geometry.center();
		this.nameObject = new THREE.Mesh(geometry, material);
		let coord = SkySphere.raDecToCartesian(110, this.ra, this.dec);
		this.nameObject.position.copy(coord);
		this.nameObject.name = this.fullName;
	}

	addNameToScene(scene) {
		scene.add(this.nameObject);
	}
}
