/**
 * Star
 * Class for holding stars informations
 * @class
 */
class Star {
	/**
	 * Constructor for Star
	 * @param {*} ra
	 * @param {*} dec
	 * @param {*} magnitude
	 * @param {*} colour
	 * @param {*} name
	 * @param {*} distance
	 * @param {*} constellation
	 * @param {*} geometry
	 * @param {*} constellationObject
	 */
	constructor(
		ra,
		dec,
		magnitude,
		colour,
		name,
		distance,
		constellation,
		geometry,
		constellationObject
	) {
		this.ra = ra;
		this.dec = dec;
		this.magnitude = magnitude;
		this.colour = colour;
		this.meshName = name;
		this.distance = distance;
		this.constellation = constellation;
		this.constellationObject = constellationObject;

		//let geometry = new THREE.SphereBufferGeometry(0.75, 10, 10);
		//geometry = new THREE.SphereBufferGeometry(0.75, 10, 10);

		// Creating 3D geometry object
		this.material = new THREE.MeshBasicMaterial({ color: this.colour.getStyle(), transparent: true });
		this.mesh = new THREE.Mesh(geometry, this.material);

		this.position = this.mesh.position;
		this.rotation = this.mesh.rotation;
		this.scale = this.mesh.scale;

		this.position.copy(SkySphere.raDecToCartesian(100, this.ra, this.dec));
		this.scale.multiplyScalar(this.getScaleFactor());

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
