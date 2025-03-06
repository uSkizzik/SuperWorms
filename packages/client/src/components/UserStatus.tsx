import { UserState } from "@superworms/server/src/states/UserState"

function UserStatus({ user }: { user: UserState }) {
	const isSpeaking = true

	return (
		<div className={`tw:flex tw:items-center tw:mb-2 tw:opacity-${isSpeaking ? "100" : "50"}`}>
			<img className="tw:me-2 tw:size-9 tw:rounded-full" src={`https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.webp`} />
			<span className="tw:text-white tw:bg-[#212121aa] tw:rounded-lg tw:px-2 tw:py-1">{user.username}</span>
		</div>
	)
}

export default UserStatus
