import Phaser from "phaser"
import { Game } from "../scenes/Game"

import { PlayerController } from "@superworms/server/src/actors/PlayerController"
import type { RotateData } from "@superworms/server/src/messages/RotateData"

export class Player extends Phaser.GameObjects.GameObject {
	scene: Game
	controller?: PlayerController

	headPos: Phaser.Geom.Point
	tailPos: Phaser.Geom.Point

	head: Phaser.GameObjects.Group
	playerBody: Phaser.GameObjects.Group

	angle: number = 0
	speed: number

	private refreshTimer: Phaser.Time.TimerEvent

	constructor(scene: Game, x: number, y: number) {
		super(scene, "player")

		this.scene = scene

		this.headPos = new Phaser.Geom.Point(x, y)
		this.tailPos = new Phaser.Geom.Point(x, y)

		this.playerBody = scene.add.group()

		this.head = this.playerBody.create(x * 16, y * 16, "body")
		this.head.setOrigin(0.5)

		this.speed = 150

		// Refresh local player position from server once 3 seconds to avoid desync
		// this.refreshTimer = this.scene.time.addEvent({
		// 	callback: this.updateRemote,
		// 	callbackScope: this,
		// 	delay: 3000,
		// 	loop: true
		// })

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

		this.controller?.calculateMovement({ x: ptrX, y: ptrY })
		Phaser.Actions.ShiftPosition(this.playerBody.getChildren(), this.headPos.x, this.headPos.y, 0, new Phaser.Math.Vector2(this.tailPos))
	}

	grow() {
		const newPart = this.playerBody.create(this.tailPos.x, this.tailPos.y, "body")
		newPart.setOrigin(0.5)
	}
}
