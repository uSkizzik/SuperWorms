import Phaser from "phaser"
import { GameScene } from "../scenes/GameScene.ts"

export class OrbActor extends Phaser.GameObjects.GameObject {
	scene: GameScene

	x: number
	y: number

	score: number
	color: number

	circle: Phaser.GameObjects.GameObject

	constructor(scene: GameScene, x: number, y: number, score: number, color: number) {
		super(scene, "orb")

		this.scene = scene

		this.x = x
		this.y = y

		this.score = score
		this.color = color

		this.addToUpdateList()

		this.circle = this.scene.add.circle(this.x, this.y, this.score * 2, this.color)
	}

	destroy(fromScene?: boolean) {
		super.destroy(fromScene)
		this.circle.destroy()
	}

	preUpdate() {}
}
