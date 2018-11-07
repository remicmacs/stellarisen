/**
 * Link
 * Class for representing a segment between two connected stars of a
 * Constellation
 * @class
 */
class Link {
	/**
	 * Constructor for Link object
	 * @constructor
	 * @param {*} firstRa
	 * @param {*} secondRa
	 * @param {*} firstDec
	 * @param {*} secondDec
	 * @param {*} constellationName
	 */
	constructor(firstRa, secondRa, firstDec, secondDec, constellationName) {
		const geometry = new THREE.Geometry();
		this.material = new THREE.LineBasicMaterial(
			{	color: 0x555555
			,	linewidth: 2
			,	transparent: true
			});

		const firstCoord = SkySphere.raDecToCartesian(100, firstRa, firstDec);
		const secondCoord = SkySphere.raDecToCartesian(100, secondRa, secondDec);
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
