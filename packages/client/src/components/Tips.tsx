import { useEffect, useState } from "react"

import type { LobbyRoomState } from "@superworms/server/src/states/LobbyRoomState.ts"

import { colyseus } from "../managers/Colyseus.ts"
import { discord, isEmbedded } from "../managers/Discord.ts"

function Tips() {
	const subtitles = ["Eat to grow longer", "Don't run into other players", "When longer hold the mouse to become faster", "Use the power-ups to your advantage", "Become the biggest"]

	const [currSubtitle, setCurrSubtitle] = useState(subtitles.length - 1)
	const [subtitleVisible, setSubtitleVisible] = useState(false)

	useEffect(() => {
		if (isEmbedded && !colyseus.auth.token) return

		const timeout = setTimeout(() => {
			setSubtitleVisible(!subtitleVisible)

			if (!subtitleVisible) {
				let newSub = currSubtitle + 1
				if (newSub > subtitles.length - 1) newSub = 0

				setCurrSubtitle(newSub)
			}
		}, 1500)
		return () => clearTimeout(timeout)
	}, [subtitleVisible, colyseus.auth.token])

	return (
		<span className="tw:font-semibold tw:duration-1300" style={{ opacity: subtitleVisible ? 1 : 0 }}>
			{subtitles[currSubtitle]}
		</span>
	)
}

export default Tips
