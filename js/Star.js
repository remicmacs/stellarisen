/**
 * Star
 * Class for holding stars informations
 * @class
 */
class Star {
	constructor(dict) {
		this.ra = dict.ra;
		this.dec = dict.dec;
		this.magnitude = dict.magnitude;
		this.colour = dict.colour;
		this.meshName = dict.name;
		this.distance = dict.distance;
		this.constellation = dict.constellation;
		this.constellationObject = dict.constellationObject;

		this.material = new THREE.SpriteMaterial(
			{	map: dict["texture"]
			,	color: this.colour.getHex()
			,	transparent: true
			,	depthWrite: false
			});
		this.mesh = new THREE.Sprite(this.material);

		this.position = this.mesh.position;
		this.rotation = this.mesh.rotation;
		this.scale = this.mesh.scale;

		this.mesh.scale.multiplyScalar(4);
		this.mesh.scale.multiplyScalar(this.getScaleFactor());

		this.position.copy(SkySphere.raDecToCartesian(100, this.ra, this.dec));
		//this.scale.multiplyScalar(this.getScaleFactor());

		this.mesh.name = this.meshName;
		this.mesh.userData = { "type": "star" };
	}

	/**
	 * Adds the Star to the given Three.js scene
	 * @param {Scene} scene Scene object from Three.js, represents the whole scene
	 * viewed by the user
	 */
	addToScene(scene) {
		scene.add(this.mesh);
	}

	getScaleFactor() {
		return Star.getScaleFactor(this.magnitude);
	}

	static getScaleFactor(magnitude) {
		let scalar = Math.pow(10, magnitude / -2.5);
		scalar = Math.min(1.0, scalar);
		scalar = map(scalar, 0, 1, 0.4, 1);
		return scalar
	}
}
