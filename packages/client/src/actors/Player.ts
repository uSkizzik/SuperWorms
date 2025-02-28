import Phaser from "phaser"
import { Game } from "../scenes/Game.ts"

import { RotateData } from "@superworms/server/src/messages/RotateData.ts"
import { calcPlayerMovement } from "@superworms/server/src/util"

export class Player extends Phaser.GameObjects.GameObject {
	scene: Game

	headPos: Phaser.Geom.Point
	tailPos: Phaser.Geom.Point

	head: Phaser.GameObjects.Group
	playerBody: Phaser.GameObjects.Group

	angle: number = 0
	speed: number

	constructor(scene: Game, x: number, y: number) {
		super(scene, "player")

		this.scene = scene

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

	updateRemote() {
		const { serverX, serverY } = this.data.values

		this.headPos.x = Phaser.Math.Linear(this.headPos.x, serverX, 0.2)
		this.headPos.y = Phaser.Math.Linear(this.headPos.y, serverY, 0.2)

		Phaser.Actions.ShiftPosition(this.playerBody.getChildren(), this.headPos.x, this.headPos.y, 0, new Phaser.Math.Vector2(this.tailPos))
	}

	updateLocal() {
		this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main)

		const { worldX: ptrX, worldY: ptrY } = this.scene.input.activePointer

		this.scene.room?.send("rotate", {
			pointer: {
				x: this.scene.input.activePointer.worldX,
				y: this.scene.input.activePointer.worldY
			}
		} as RotateData)

		calcPlayerMovement(this, { x: ptrX, y: ptrY })
		Phaser.Actions.ShiftPosition(this.playerBody.getChildren(), this.headPos.x, this.headPos.y, 0, new Phaser.Math.Vector2(this.tailPos))
	}

	grow() {
		const newPart = this.playerBody.create(this.tailPos.x, this.tailPos.y, "body")
		newPart.setOrigin(0.5)
	}
}
