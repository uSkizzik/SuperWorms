import { useState } from "react"

import Home from "./pages/Home.tsx"
import Game from "./pages/Game.tsx"

function App() {
	const [page, setPage] = useState<"home" | "game">("home")
	const [username, setUsername] = useState<string>("")

	switch (page) {
		case "home":
			return <Home setPage={setPage} setUsername={setUsername} />

		case "game":
			return <Game username={username} />
	}
}

export default App
