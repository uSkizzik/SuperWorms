import Phaser from "phaser"
import { GameScene } from "../scenes/GameScene.ts"

import { PlayerController } from "@superworms/server/src/controllers/PlayerController"
import type { RotateData } from "@superworms/server/src/messages/RotateData"

export class PlayerActor extends Phaser.GameObjects.GameObject {
	scene: GameScene
	controller?: PlayerController

	headPos: Phaser.Geom.Point
	tailPos: Phaser.Geom.Point

	head: Phaser.GameObjects.Group
	bodyParts: Phaser.GameObjects.Group

	angle: number = 0

	score: number = 0

	constructor(scene: GameScene, x: number, y: number) {
		super(scene, "player")

		this.scene = scene

		this.headPos = new Phaser.Geom.Point(x, y)
		this.tailPos = new Phaser.Geom.Point(x, y)

		this.bodyParts = scene.add.group()

		this.head = this.bodyParts.create(x * 16, y * 16, "body")
		this.head.setOrigin(0.5)

		this.addToUpdateList()

		this.scene.input.on("pointerdown", () => this.controller!.startSprint())
		this.scene.input.on("pointerup", () => this.controller!.stopSprint())
	}

	preUpdate(delta: number) {
		if (this.controller) {
			if (this.scene!.room!.sessionId === this.controller.sessionId) this.updateLocalPos()
			else this.updateRemotePos()
		}
	}

	updateLocalPos() {
		// Update local player actor
		this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main)

		const { worldX: ptrX, worldY: ptrY } = this.scene.input.activePointer

		this.scene.room?.send("rotate", {
			pointer: {
				x: ptrX,
				y: ptrY
			}
		} as RotateData)

		// this.controller?.calculateAngle({ x: ptrX, y: ptrY })
		// this.controller?.calculateMovement()
		//
		// this.tailPos = Phaser.Actions.ShiftPosition(this.bodyParts.getChildren(), this.headPos.x, this.headPos.y, 1)

		this.updateRemotePos()
	}

	updateRemotePos() {
		if (!this.data) return

		const { serverX = 0, serverY = 0 } = this.data.values

		this.headPos.x = Phaser.Math.Linear(this.headPos.x, serverX, 0.2)
		this.headPos.y = Phaser.Math.Linear(this.headPos.y, serverY, 0.2)

		let tailVec = Phaser.Actions.ShiftPosition(this.bodyParts.getChildren(), this.headPos.x, this.headPos.y, 1)
		this.tailPos.setTo(tailVec.x, tailVec.y)
	}

	updateLength() {
		let diff = this.controller!.state.score - this.score
		this.score = this.controller!.state.score

		if (diff > 0) {
			for (let i = 0; i < diff; i++) {
				this.bodyParts.create(this.tailPos.x, this.tailPos.y, "body").setOrigin(0.5)
			}
		} else {
			let bodyParts = this.bodyParts.getChildren()

			for (let i = 0; i < diff * -1; i++) {
				this.bodyParts.remove(bodyParts[bodyParts.length - i - 1], true, true)
			}
		}
	}
}
