import Phaser from "phaser"
import { getStateCallbacks } from "colyseus.js"

import type { PlayerState } from "@superworms/server/src/states/PlayerState.ts"
import { maxMapRadius, zoneSize } from "@superworms/server/src/util"

import { GameScene } from "../scenes/GameScene.ts"

export class Debugger {
	private readonly scene: GameScene

	private isDebugVisible: boolean = import.meta.env.DEV

	private readonly coords: Phaser.GameObjects.Text

	private readonly gridGraphics: Phaser.GameObjects.Graphics
	private readonly zoneInfo: Phaser.GameObjects.Text

	constructor(scene: GameScene) {
		this.scene = scene

		this.coords = scene.add
			.text(0, 0, "", {
				fontSize: "24px",
				color: "#fff",
				backgroundColor: "#00000080",
				padding: { x: 10, y: 5 }
			})
			.setOrigin(0)
			.setScrollFactor(0)
			.setDepth(2)
			.setVisible(this.isDebugVisible)

		this.gridGraphics = scene.add.graphics().setVisible(this.isDebugVisible)
		this.zoneInfo = scene.add.text(0, 0, "", { fontSize: "16px", color: "#00ff00" }).setOrigin(0.5).setDepth(2).setVisible(this.isDebugVisible)

		// this.drawZones()
	}

	registerInputs() {
		this.scene.input.on("pointermove", (pointer) => {
			let { worldX: ptrX, worldY: ptrY } = pointer
			let x = Math.floor(ptrX / zoneSize)
			let y = Math.floor(ptrY / zoneSize)

			this.zoneInfo.setText(`${x};${y}`)
			this.zoneInfo.setPosition(x * zoneSize + zoneSize / 2, y * zoneSize + zoneSize / 2)
			this.zoneInfo.setFontSize(64)
		})

		this.scene.input.on("wheel", (pointer, currentlyOver, deltaX, deltaY) => {
			const { main: mainCamera } = this.scene.cameras
			mainCamera.setZoom(Phaser.Math.Clamp(mainCamera.zoom + (deltaY / 800) * -1, 0.125, 4))
		})

		this.scene.input.keyboard?.on("keydown-Z", () => {
			this.isDebugVisible = !this.isDebugVisible

			this.gridGraphics.setVisible(this.isDebugVisible)
			this.zoneInfo.setVisible(this.isDebugVisible)
		})
	}

	registerStateCallbacks() {
		const $ = getStateCallbacks(this.scene.room!)
		$(this.scene.localPlayer?.controller?.state!).loadedZones.onAdd(() => this.drawZones())
	}

	isZoneLoaded(worldX: number, worldY: number) {
		let coords = [Math.floor(worldX / zoneSize), Math.floor(worldY / zoneSize)]

		for (let zone of this.scene.localPlayer?.controller?.state.loadedZones ?? []) {
			if (zone.x === coords[0] && zone.y === coords[1]) return true
		}
	}

	drawZones() {
		const offset = -maxMapRadius / 2 - zoneSize

		this.gridGraphics.clear()

		for (let y = offset; y <= maxMapRadius; y += zoneSize) {
			for (let x = offset; x <= maxMapRadius; x += zoneSize) {
				this.gridGraphics.lineStyle(2, this.isZoneLoaded(x, y) ? 0xffff00 : 0x00ff00, 1)
				this.gridGraphics.strokeRect(x, y, zoneSize, zoneSize)
			}
		}

		this.gridGraphics.setDepth(1)
	}

	tick() {
		this.coords.setText(`X = ${Math.round(this.scene.localPlayer?.controller?.state.headPos.x!)}; Y = ${Math.round(this.scene.localPlayer?.controller?.state.headPos.y!)}`)
	}
}
