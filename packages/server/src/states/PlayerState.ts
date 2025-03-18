import { Schema, SetSchema, type, view } from "@colyseus/schema"

import { EStatusEffect } from "../effects/EStatusEffect.ts"

import { PointState } from "./PointState"
import { ZoneState } from "./ZoneState"

import { normalPickupRadius, normalSpeed } from "../util"

export class PlayerState extends Schema {
	@type("string") username: string = ""

	@type("int8") angle: number = 0

	@type(PointState) headPos: PointState = new PointState()
	@type(PointState) tailPos: PointState = new PointState()
	@type([PointState]) bodyParts: PointState[] = []

	@type("uint16") pickupRadius: number = normalPickupRadius

	@type("boolean")
	isSprintEnabled: boolean = true
	@type("boolean") isSprinting: boolean = false
	@type("uint16") speed: number = normalSpeed

	@type("uint16") score: number = 10
	@type({ set: "uint8" }) statusEffects: SetSchema<EStatusEffect> = new SetSchema<EStatusEffect>()

	@view() @type({ set: ZoneState }) loadedZones: SetSchema<ZoneState> = new SetSchema<ZoneState>()
}
