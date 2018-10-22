class Constellation {
	constructor(dict) {
		this.ra = dict["ra"];
		this.dec = dict["dec"];
		this.shortName = dict["shortName"];
		this.fullName = dict["fullName"];

		let links = dict["links"];
		let stars = dict["stars"];

		this.links = [];
		this.stars = [];

		this.nameVisible = true;

		let constellationLinks =
			{	"ra": this.ra
			,	"dec": this.dec
			,	"lines": []
			};

		let geometry = new THREE.SphereBufferGeometry(0.75, 10, 10);

		/* Pour chaque segment de la constellation, on va créer les
		étoiles et les lignes qui seront affichées */
		for (let j = 0; j < links.length; j++) {
			let star;

			/* On crée les étoiles seulement si elle n'est pas encore créée */
			if (!this.isPresent(stars[links[j][0]]["proper"])) {
				let args =
					{	"ra": stars[links[j][0]]["ra"].valueOf()
					, "dec": stars[links[j][0]]["dec"].valueOf()
					,	"magnitude": stars[links[j][0]]["mag"].valueOf()
					, "colour": new THREE.Color().fromArray
						(	stars[links[j][0]]["colour"].split(" ").map
							(	(x) => { return x / 255; } )
						)
					, "name": stars[links[j][0]]["proper"]
					, "distance": stars[links[j][0]]["dist"].valueOf()
					, "constellation": stars[links[j][0]]["con"]
					, "geometry": geometry
					, "constellationObject": this
					, "texture": dict["starTexture"]
					}
				star = new Star(args);

				this.stars.push(star);
			}

			/* On crée les étoiles seulement si elle n'est pas encore créée */
			if (!this.isPresent(stars[links[j][1]]["proper"])) {
				let args =
					{	"ra": stars[links[j][1]]["ra"].valueOf()
					, "dec": stars[links[j][1]]["dec"].valueOf()
					,	"magnitude": stars[links[j][1]]["mag"].valueOf()
					, "colour": new THREE.Color().fromArray
						(	stars[links[j][1]]["colour"].split(" ").map
							(	(x) => { return x / 255; } )
						)
					, "name": stars[links[j][1]]["proper"]
					, "distance": stars[links[j][1]]["dist"].valueOf()
					, "constellation": stars[links[j][1]]["con"]
					, "geometry": geometry
					, "constellationObject": this
					, "texture": dict["starTexture"]
					}
				star = new Star(args);

				this.stars.push(star);
			}

			let link = new Link
				( stars[links[j][0]]["ra"].valueOf()
				,	stars[links[j][1]]["ra"].valueOf()
				,	stars[links[j][0]]["dec"].valueOf()
				,	stars[links[j][1]]["dec"].valueOf()
				,	this.fullName
				);
			this.links.push(link);
		}
	}

	addToScene(scene) {
		for (let i = 0; i < this.links.length; i++) {
			this.links[i].addToScene(scene);
		}

		for (let i = 0; i < this.stars.length; i++) {
			this.stars[i].addToScene(scene);
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
		if (this.nameVisible) {
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

	isPresent(starName) {
		for (let i = 0; i < this.stars.length; i++) {
			if (this.stars[i].meshName == starName) {
				return true;
			}
		}
		return false;
	}

	hideLinks() {
		for (let i = 0; i < this.links.length; i++) {
			this.links[i].line.visible = false;
		}
	}

	showLinks() {
		for (let i = 0; i < this.links.length; i++) {
			this.links[i].line.visible = true;
		}
	}

	hideName() {
		this.nameObject.visible = false;
		this.nameVisible = false;
	}

	showName() {
		this.nameObject.visible = true;
		this.nameVisible = true;
	}

}
