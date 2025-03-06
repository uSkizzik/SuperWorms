import crypto from "crypto"
import { type } from "@colyseus/schema"

import { EStatusEffect } from "../effects/EStatusEffect.ts"

import { PointState } from "./PointState"

export class OrbState extends PointState {
	@type("string") id = crypto.randomUUID()

	@type("number") score: number = 1
	@type("number") color: number = 0xff0000

	@type("number") statusEffect: EStatusEffect | 0 = EStatusEffect.NONE
}
