import { generateId } from "@colyseus/core"
import { type } from "@colyseus/schema"

import { EStatusEffect } from "../effects/EStatusEffect.ts"

import { PointState } from "./PointState"

export class OrbState extends PointState {
	@type("string") id = generateId()

	@type("uint8") score: number = 1
	@type("uint32") color: number = 0xff0000

	@type("uint8") statusEffect: EStatusEffect | 0 = EStatusEffect.NONE
}
