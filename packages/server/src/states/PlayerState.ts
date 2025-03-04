import { Schema, type } from "@colyseus/schema"

import { PointState } from "./PointState"
import { normalSpeed } from "../util"

export class PlayerState extends Schema {
	@type("number") angle: number = 0

	@type(PointState) headPos: PointState = new PointState()
	@type(PointState) tailPos: PointState = new PointState()
	@type([PointState]) bodyParts: PointState[] = []

	@type("boolean") isSprinting: boolean = false
	@type("number") speed: number = normalSpeed

	@type("number") score: number = 10
}
