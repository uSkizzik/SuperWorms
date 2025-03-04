import Phaser from "phaser"
import { Game } from "../scenes/Game"

import { PlayerController } from "packages/server/src/controllers/PlayerController"
import type { RotateData } from "@superworms/server/src/messages/RotateData"

import { normalSpeed } from "@superworms/server/src/util"

export class PlayerActor extends Phaser.GameObjects.GameObject {
	scene: Game
	controller?: PlayerController

	headPos: Phaser.Geom.Point
	tailPos: Phaser.Geom.Point

	head: Phaser.GameObjects.Group
	bodyParts: Phaser.GameObjects.Group

	angle: number = 0
	speed: number = normalSpeed

	score: number = 0

	constructor(scene: Game, x: number, y: number) {
		super(scene, "player")

		this.scene = scene

		this.headPos = new Phaser.Geom.Point(x, y)
		this.tailPos = new Phaser.Geom.Point(x, y)

		this.bodyParts = scene.add.group()

		this.head = this.bodyParts.create(x * 16, y * 16, "body")
		this.head.setOrigin(0.5)

		this.addToUpdateList()
		this.updateLength(10)

		this.scene.input.on("pointerdown", () => this.controller!.startSprint())
		this.scene.input.on("pointerup", () => this.controller!.stopSprint())
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
				this.tailPos = this.controller?.calculateMovement()

				this.updateRemotePos()
			} else this.updateRemotePos()
		}
	}

	updateRemotePos() {
		if (!this.data) return

		const { serverX, serverY } = this.data.values

		this.headPos.x = Phaser.Math.Linear(this.headPos.x, serverX, 0.2)
		this.headPos.y = Phaser.Math.Linear(this.headPos.y, serverY, 0.2)

		this.tailPos = Phaser.Actions.ShiftPosition(this.bodyParts.getChildren(), this.headPos.x, this.headPos.y, 0)
	}

	updateLength(value) {
		let diff = value - this.score
		this.score = value

		if (diff > 0) {
			for (let i = 0; i < diff; i++) {
				this.bodyParts.create(this.tailPos.x, this.tailPos.y, "body").setOrigin(0.5)
			}
		} else {
			let bodyParts = this.bodyParts.getChildren()

			for (let i = 0; i < diff * -1; i++) {
				this.bodyParts.remove(bodyParts[bodyParts.length - i], true, true)
			}
		}
	}
}
