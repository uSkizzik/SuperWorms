import Phaser from "phaser"
import { Game } from "../scenes/Game"

import { PlayerController } from "@superworms/server/src/actors/PlayerController"
import type { RotateData } from "@superworms/server/src/messages/RotateData"
import { normalSpeed } from "@superworms/server/src/util"

export class PlayerActor extends Phaser.GameObjects.GameObject {
	scene: Game
	controller?: PlayerController

	headPos: Phaser.Geom.Point
	tailPos: Phaser.Geom.Point

	head: Phaser.GameObjects.Group
	playerBody: Phaser.GameObjects.Group

	angle: number = 0
	speed: number = normalSpeed

	score: number = 0

	constructor(scene: Game, x: number, y: number) {
		super(scene, "player")

		this.scene = scene

		this.headPos = new Phaser.Geom.Point(x, y)
		this.tailPos = new Phaser.Geom.Point(x, y)

		this.playerBody = scene.add.group()

		this.head = this.playerBody.create(x * 16, y * 16, "body")
		this.head.setOrigin(0.5)

		this.addToUpdateList()
		this.updateLength(10)
	}

	preUpdate(delta: number) {
		if (this.controller) {
			if (this.scene!.room.sessionId === this.controller.sessionId) {
				// Update local player actor
				this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main)

				const { worldX: ptrX, worldY: ptrY } = this.scene.input.activePointer

				this.scene.room?.send("rotate", {
					pointer: {
						x: this.scene.input.activePointer.worldX,
						y: this.scene.input.activePointer.worldY
					}
				} as RotateData)

				this.controller?.calculateAngle({ x: ptrX, y: ptrY })
				this.controller?.calculateMovement()

				Phaser.Actions.ShiftPosition(this.playerBody.getChildren(), this.headPos.x, this.headPos.y, 0, new Phaser.Math.Vector2(this.tailPos))

				this.updateRemotePos()
			} else this.updateRemotePos()
		}
	}

	updateRemotePos() {
		if (!this.data) return

		const { serverX, serverY } = this.data.values

		this.headPos.x = Phaser.Math.Linear(this.headPos.x, serverX, 0.2)
		this.headPos.y = Phaser.Math.Linear(this.headPos.y, serverY, 0.2)

		Phaser.Actions.ShiftPosition(this.playerBody.getChildren(), this.headPos.x, this.headPos.y, 0, new Phaser.Math.Vector2(this.tailPos))
	}

	updateLength(value) {
		for (let i = 0; i < value - this.score; i++) {
			this.grow()
		}
	}

	grow() {
		this.playerBody.create(this.tailPos.x, this.tailPos.y, "body").setOrigin(0.5)
	}
}
