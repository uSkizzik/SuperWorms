import Phaser from "phaser"

export class Orb extends Phaser.GameObjects.Arc {
	constructor(scene: Phaser.Scene, x: number, y: number, size: number, color: number) {
		super(scene, x, y, 1, undefined, undefined, undefined, color)
	}
}
