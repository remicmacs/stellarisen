/**
 * Constellation
 * Class to hold constellation data
 * @class
 */
class Constellation {
	// Dead code
	/*constructor(ra, dec, fullName, links, stars) {
		this.ra = ra;
		this.dec = dec;
		this.fullName = fullName;*/

	/**
	 * Constructor for Constellation object
	 * @constructor
	 * @param {Object} dict Contains all parameters
	 */
	constructor(dict) {
		this.ra = dict.ra;
		this.dec = dict.dec;
		this.shortName = dict.shortName;
		this.fullName = dict.fullName;

		const links = dict.links;
		const stars = dict.stars;

		this.links = [];
		this.stars = [];

		// Dead code
		/*let constellationLinks =
			{	"ra": this.ra
			,	"dec": this.dec
			,	"lines": []
			};*/

		const geometry = new THREE.SphereBufferGeometry(0.75, 10, 10);

		/* For each link of Constellation, creating stars and lines to display */
		for (let j = 0; j < links.length; j++) {
			let star;

			/**
			 *  @TODO :This part could be simplified with a HashMap ({} in JS)
			 * `this.stars` would be an object rather than an Array, and checking
			 * every start would be O(log(n)) rather than O(n)
			 */
			/* Creating starting point Star only if not yet created */
			if (!this.isPresent(stars[links[j][0]]["proper"])) {
				star = new Star
					(	stars[links[j][0]]["ra"].valueOf()
					,	stars[links[j][0]]["dec"].valueOf()
					,	stars[links[j][0]]["mag"].valueOf()
					,	new THREE.Color().fromArray
						(	stars[links[j][0]]["colour"].split(" ").map
							(	(x) => { return x / 255; } )
						)
					,	stars[links[j][0]]["proper"]
					, stars[links[j][0]]["dist"].valueOf()
					, stars[links[j][0]]["con"]
					,	geometry
					,	this
					);

				this.stars.push(star);
			}

			/* Creating end point Star only if not yet created */
			if (!this.isPresent(stars[links[j][1]]["proper"])) {
				star = new Star
					(	stars[links[j][1]]["ra"].valueOf()
					,	stars[links[j][1]]["dec"].valueOf()
					,	stars[links[j][1]]["mag"].valueOf()
					,	new THREE.Color().fromArray
						(	stars[links[j][1]]["colour"].split(" ").map
							(	(x) => { return x / 255; } )
						)
					,	stars[links[j][1]]["proper"]
					, stars[links[j][1]]["dist"].valueOf()
					, stars[links[j][1]]["con"]
					,	geometry
					,	this
					);

				this.stars.push(star);
			}

			const link = new Link(
				stars[links[j][0]]["ra"].valueOf()
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

	/**
	 * Generates a 3D text object to add to a Three.js scene
	 * @param {*} font
	 */
	generateName(font) {
		const options = { font: font, size: 2.5, height: 0.1, curveSegments: 12, bevelEnabled: false };

		const material = new THREE.MeshBasicMaterial(
			{	color: 0xffffff
			,	transparent: true
			});
		const geometry = new THREE.TextBufferGeometry(this.fullName, options);
		geometry.center();
		this.nameObject = new THREE.Mesh(geometry, material);
		const coord = SkySphere.raDecToCartesian(110, this.ra, this.dec);
		this.nameObject.position.copy(coord);
		this.nameObject.name = this.fullName;
	}

	addNameToScene(scene) {
		scene.add(this.nameObject);
	}

	/**
	 * Update procedure to handle the size and orientation of the text
	 * representing the names of the constellation
	 * @param {real} distance Represents the distance of the Constellation object
	 * @param {Camera} camera Camera object from Three.js
	 */
	updateNames(distance, camera) {
		const constellationName = this.nameObject;

		/* Hiding name above distance of 100 */
		if (distance > 100 && constellationName.visible) {
			constellationName.visible = false;
		}
		/* Showing name under 100 */
		else if (distance < 100 && !constellationName.visible) {
			constellationName.visible = true;
		}


		if (distance < 100) {
			/* Distance < 50 : opacity max */
			if (distance < 50) {
				constellationName.material.opacity = 1;
			/* Distance [50;100[ : opacity depends on distance */
			} else {
				constellationName.material.opacity = 1 - ((distance - 50) / 50);
			}
			/* Texts are always aligned to Camera view */
			camera.getWorldQuaternion(constellationName.quaternion);
		}
	}

	/**
	 * Checks the existence of a star in a Constellation
	 * @param {string} starName The name of the Star we want to check existence
	 */
	isPresent(starName) {
		for (let i = 0; i < this.stars.length; i++) {
			if (this.stars[i].meshName === starName) {
				return true;
			}
		}
		return false;
	}

}
