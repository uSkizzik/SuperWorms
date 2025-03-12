function isServer() {
	return Boolean(process.env.I_AM_SERVER !== undefined)
}

export function OnlyIn(destination: "CLIENT" | "SERVER" | "BOTH") {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const bIsServer = isServer()

		if ((destination === "CLIENT" && bIsServer) || (destination === "SERVER" && !bIsServer)) {
			descriptor.enumerable = false
			descriptor.value = undefined
		}
	}
}
