class Visor {
	constructor(texture) {
		this.material = new THREE.SpriteMaterial(
			{	map: texture
			,	color: 0xffffff
			,	transparent: true
			,	depthWrite: false
			});
		this.sprite = new THREE.Sprite(this.material);
		this.sprite.position.z = -10;
		this.position = this.sprite.position;
		this.star = undefined;
	}

	addToScene(scene) {
		scene.add(this.sprite);
	}

	setTarget(star) {
		this.previousStar = this.star;
		this.star = star;
		this.position.copy(SkySphere.raDecToCartesian(10, this.star.ra, this.star.dec));
		this.show();
	}

	show() {
		this.sprite.visible = true;
	}

	hide() {
		this.sprite.visible = false;	
	}

	isVisible() {
		return this.sprite.visible;
	}
}
