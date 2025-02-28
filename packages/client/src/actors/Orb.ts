import Phaser from "phaser"
import { Game } from "../scenes/Game"

export class Orb extends Phaser.GameObjects.GameObject {
	scene: Game

	x: number
	y: number

	score: number
	color: number

	constructor(scene: Game, x: number, y: number, score: number, color: number) {
		super(scene, "orb")

		this.scene = scene

		this.x = x
		this.y = y

		this.score = score
		this.color = color

		this.addToUpdateList()

		this.scene.add.circle(this.x, this.y, this.score * 2, this.color)
	}

	preUpdate() {}
}
