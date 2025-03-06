import Phaser from "phaser"

import type { OrbState } from "@superworms/server/src/states/OrbState.ts"

import { GameScene } from "../scenes/GameScene.ts"

export class OrbActor extends Phaser.GameObjects.GameObject {
	scene: GameScene
	orbState: OrbState

	shape: Phaser.GameObjects.GameObject

	constructor(scene: GameScene, state: OrbState) {
		super(scene, "orb")

		this.scene = scene
		this.orbState = state

		this.addToUpdateList()

		if (this.orbState.statusEffect) this.shape = this.scene.add.rectangle(this.orbState.x, this.orbState.y, this.orbState.score * 2, this.orbState.score * 2, this.orbState.color)
		else this.shape = this.scene.add.circle(this.orbState.x, this.orbState.y, this.orbState.score * 2, this.orbState.color)
	}

	destroy(fromScene?: boolean) {
		super.destroy(fromScene)
		this.shape.destroy()
	}

	preUpdate() {}
}
