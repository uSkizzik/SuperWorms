import Phaser from "phaser"

export class Player extends Phaser.GameObjects.GameObject {
	headPos: Phaser.Geom.Point
	tailPos: Phaser.Geom.Point

	head: Phaser.GameObjects.Group
	playerBody: Phaser.GameObjects.Group

	lastAngle: number = 0
	speed: number

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, "player")

		this.headPos = new Phaser.Geom.Point(x, y)
		this.tailPos = new Phaser.Geom.Point(x, y)

		this.playerBody = scene.add.group()

		this.head = this.playerBody.create(x * 16, y * 16, "body")
		this.head.setOrigin(0.5)

		this.speed = 150

		this.grow()
		this.grow()
		this.grow()
		this.grow()
		this.grow()
		this.grow()
	}

	update() {
		this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main)

		// const dx = this.scene.input.activePointer.worldX - this.headPos.x
		// const dy = this.scene.input.activePointer.worldY - this.headPos.y
		//
		// const angle = Math.atan2(dy, dx)
		//
		// if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
		// 	this.lastAngle = angle
		// }

		// console.log(this.lastAngle)

		// this.headPos.x += (this.speed / 100) * Math.cos(this.lastAngle)
		// this.headPos.y += (this.speed / 100) * Math.sin(this.lastAngle)

		Phaser.Actions.ShiftPosition(this.playerBody.getChildren(), this.headPos.x, this.headPos.y, 0, new Phaser.Math.Vector2(this.tailPos))
	}

	grow() {
		const newPart = this.playerBody.create(this.tailPos.x, this.tailPos.y, "body")
		newPart.setOrigin(0.5)
	}
}
