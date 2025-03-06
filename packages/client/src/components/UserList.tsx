import { useEffect } from "react"
import { useImmer } from "use-immer"

import { MapSchema } from "@colyseus/schema"
import { Types } from "@discord/embedded-app-sdk"

import { UserState } from "@superworms/server/src/states/UserState"

import { discord } from "../managers/Discord.ts"

import UserStatus from "./UserStatus.tsx"

function UserList({ users }: { users: MapSchema<UserState> }) {
	const [voiceStates, updateVoiceStates] = useImmer(new Map<string, Partial<Types.VoiceState & { speaking: boolean }>>())

	const startSpeaking = ({ user_id }: { user_id: string }) => {
		console.log("asd")
		updateVoiceStates((draft) => draft.set(user_id, { speaking: true }))
	}

	const stopSpeaking = ({ user_id }: { user_id: string }) => {
		updateVoiceStates((draft) => draft.set(user_id, { speaking: false }))
	}

	const updateVoiceState = ({ user, voice_state }: { user: { user_id: string }; voice_state: Types.VoiceState }) => {
		updateVoiceStates((draft) => draft.set(user.user_id, voice_state))
	}

	useEffect(() => {
		const registerEvents = async () => {
			await discord.subscribe("SPEAKING_START", startSpeaking, { channel_id: discord.channelId as string })
			await discord.subscribe("SPEAKING_STOP", stopSpeaking, { channel_id: discord.channelId as string })
			await discord.subscribe("VOICE_STATE_UPDATE", updateVoiceState, { channel_id: discord.channelId as string })
		}

		registerEvents().catch((e) => console.error(e))

		return () => {
			// discord.unsubscribe("SPEAKING_START", startSpeaking)
			// discord.unsubscribe("SPEAKING_STOP", stopSpeaking)
			// discord.unsubscribe("VOICE_STATE_UPDATE", updateVoiceState)
		}
	}, [])

	return <div className="tw:absolute tw:flex tw:flex-col tw:left-5">{users ? Array.from(users.values()).map((u, i) => <UserStatus key={i} voiceState={voiceStates.get(u.userId) || {}} user={u} />) : null}</div>
}

export default UserList
