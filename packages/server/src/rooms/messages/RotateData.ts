import { Schema } from "@colyseus/schema"

export class PointerData {
	x: number
	y: number
}

export class RotateData extends Schema {
	pointer: PointerData
}
