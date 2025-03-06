import { Schema, SetSchema, type } from "@colyseus/schema"

import { EStatusEffect } from "../effects/EStatusEffect.ts"

import { PointState } from "./PointState"

import { normalPickupRadius, normalSpeed } from "../util"

export class PlayerState extends Schema {
	@type("string") username: string = ""

	@type("number") angle: number = 0

	@type(PointState) headPos: PointState = new PointState()
	@type(PointState) tailPos: PointState = new PointState()
	@type([PointState]) bodyParts: PointState[] = []

	@type("number") pickupRadius: number = normalPickupRadius

	@type("boolean")
	isSprintEnabled: boolean = true
	@type("boolean") isSprinting: boolean = false
	@type("number") speed: number = normalSpeed

	@type("number") score: number = 10
	@type({ set: "number" }) statusEffects: SetSchema<EStatusEffect> = new SetSchema<EStatusEffect>()
}
