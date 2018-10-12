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

	updateNames(distance, camera) {
		let constellationName = this.nameObject;

		/* Au dessus de 100 unités, on cache l'objet */
		if (distance > 100 && constellationName.visible) {
			constellationName.visible = false;
		}
		/* En dessous de 100 unités, on montre l'objet */
		else if (distance < 100 && !constellationName.visible) {
			constellationName.visible = true;
		}

		/* En dessous de 100 unités, on change l'opacité de l'objet */
		if (distance < 100) {
			/* En dessous de 50 unités, l'objet est totalement visible */
			if (distance < 50) {
				constellationName.material.opacity = 1;
			}
			/* Entre 50 et 100 unités, son opacité dépend de sa distance */
			else {
				constellationName.material.opacity = 1 - ((distance - 50) / 50);
			}

			/* On force les textes à toujours être alignés avec la caméra */
			camera.getWorldQuaternion(constellationName.quaternion);
		}
	}
}
