import ParallaxScrollView from "@/components/parallax-scroll-view"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Collapsible } from "@/components/ui/collapsible"
import { Image } from "expo-image"
import * as Linking from "expo-linking"
import { useEffect, useRef, useState } from "react"
import { styles } from "../../css/styles"

const fetchtrendingRepos = async () => {
	try {
		const apiRepo =
			"https://api.github.com/search/repositories?q=stars:%3E10+created=today&per_page=20&sort=stars&order=desc"
		const response = await fetch(apiRepo, {
			headers: {
				accept: "application/vnd.github.v3+json",
				"User-Agent": "Chrome/143.0.0.0",
			},
		})

		if (!response.ok) {
			if (response.status === 403) {
				throw new Error(
					"GitHub API rate limit exceeded. Please try again later or add a GitHub token.",
				)
			}
			if (response.status === 404) {
				throw new Error("GitHub user not found.")
			}
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		console.log("Fetched repos data:", data)
		// Extract the items array from the GitHub API response
		return data.items || []
	} catch (error) {
		console.error("Error fetching repos:", error)
		throw error // Re-throw to preserve error details
	}
}

// Utility function to truncate description with character limit
const truncateDescription = (description: string, maxLength = 120): string => {
	if (!description || description.length <= maxLength) {
		return description || "No description provided."
	}
	// Find the last space before the max length to avoid cutting words
	const truncated = description.substring(0, maxLength)
	const lastSpaceIndex = truncated.lastIndexOf(" ")
	return lastSpaceIndex > maxLength * 0.8
		? truncated.substring(0, lastSpaceIndex) + "..."
		: truncated + "..."
}

interface RepoItemProps {
	repo: {
		name: string
		stargazers_count: number
		forks_count: number
		html_url: string
		description?: string
		language: string
		owner: {
			avatar_url: string
			login: string
		}
	}
}

const RepoItem = ({ repo }: RepoItemProps) => {
	const [isPressed, setIsPressed] = useState(false)
	console.log("Repo:", repo)
	return (
		<ThemedView
			style={{
				marginVertical: 8,
				padding: 12,
				borderRadius: 8,
				backgroundColor: isPressed
					? "rgba(0,122,255,0.1)"
					: "rgba(0,0,0,0.05)",
				borderWidth: 1,
				borderColor: isPressed ? "#007AFF" : "rgba(0,0,0,0.1)",
				transform: isPressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
			}}
			onTouchStart={() => setIsPressed(true)}
			onTouchEnd={() => {
				setIsPressed(false)
				// Navigate to repository URL on touch
				if (repo.html_url) {
					try {
						Linking.openURL(repo.html_url)
					} catch (error) {
						console.error("Error opening URL:", error)
					}
				}
			}}
			onTouchCancel={() => setIsPressed(false)}>
			<ThemedText
				type="defaultSemiBold"
				style={{ fontSize: 16, marginBottom: 4, color: "#007AFF" }}>
				{repo.name}
			</ThemedText>
			<ThemedText style={{ marginBottom: 8, fontSize: 14, opacity: 0.8 }}>
				{truncateDescription(repo.description || "", 120)}
			</ThemedText>
			<ThemedView
				style={{
					flexDirection: "row",
					alignItems: "center",
					marginBottom: 8,
				}}>
				<ThemedText style={{ marginRight: 16 }}>
					⭐ {repo.stargazers_count.toLocaleString()}
				</ThemedText>
				<ThemedText style={{ marginRight: 16 }}>
					🍴 {repo.forks_count.toLocaleString()}
				</ThemedText>
				{repo.language && <ThemedText>📝 {repo.language}</ThemedText>}
			</ThemedView>
			<ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
				<Image
					source={{ uri: repo.owner.avatar_url }}
					style={{
						width: 24,
						height: 24,
						borderRadius: 12,
						marginRight: 8,
					}}
					contentFit="cover"
					transition={1000}
				/>
				<ThemedText style={{ fontSize: 12, color: "gray" }}>
					{repo.owner.login}
				</ThemedText>
			</ThemedView>
		</ThemedView>
	)
}

const RepoList = () => {
	const [repos, setRepos] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [retryCount, setRetryCount] = useState(0)
	const cacheRef = useRef<any[] | null>(null)
	const maxRetries = 3
	const fetchRepos = async (isRetry = false) => {
		// Return cached data if available and not retrying
		if (cacheRef.current && !isRetry) {
			setRepos(cacheRef.current)
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			setError(null)
			const reposArray = await fetchtrendingRepos()
			console.log("Setting repos:", reposArray)
			cacheRef.current = reposArray
			setRepos(reposArray)
			setRetryCount(0) // Reset retry count on success
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error"
			setError(errorMessage)
			setRepos([])
			cacheRef.current = null // Clear cache on error
		} finally {
			setLoading(false)
		}
	}

	const handleRetry = async () => {
		if (retryCount < maxRetries) {
			setRetryCount((prev) => prev + 1)
			// Add a small delay before retrying to be respectful to the API
			await new Promise((resolve) => setTimeout(resolve, 1000))
			fetchRepos(true)
		}
	}

	useEffect(() => {
		fetchRepos()
	}, [])

	if (loading) {
		return (
			<ThemedText style={{ textAlign: "center", marginVertical: 20 }}>
				Loading repositories...
			</ThemedText>
		)
	}

	if (error) {
		return (
			<ThemedView style={{ alignItems: "center", marginVertical: 20 }}>
				<ThemedText
					style={{
						textAlign: "center",
						marginBottom: 16,
						color: "red",
					}}>
					Error loading repositories: {error}
				</ThemedText>
				{retryCount < maxRetries && (
					<ThemedView
						style={{
							backgroundColor: "#007AFF",
							paddingHorizontal: 20,
							paddingVertical: 10,
							borderRadius: 8,
						}}>
						<ThemedText
							style={{
								color: "white",
								fontWeight: "bold",
								textAlign: "center",
							}}
							onPress={handleRetry}>
							Retry ({retryCount}/{maxRetries})
						</ThemedText>
					</ThemedView>
				)}
			</ThemedView>
		)
	}

	if (!repos || repos.length === 0) {
		return (
			<ThemedText style={{ textAlign: "center", marginVertical: 20 }}>
				No repositories found
			</ThemedText>
		)
	}

	return (
		<ThemedView>
			{repos.map((repo, index) => (
				<RepoItem key={repo.id || index} repo={repo} />
			))}
		</ThemedView>
	)
}

export default function DiscoverScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#000000ff", dark: "#000000ff" }}
			headerImage={
				<Image
					source={require("@/assets/images/logo.png")}
					style={styles.logo}
				/>
			}>
			<ThemedText
				type="title"
				style={{
					fontFamily: "rounded",
				}}>
				Discover
			</ThemedText>
			<ThemedText type="subtitle">Trending Repositories</ThemedText>
			<Collapsible title="Repositories:">
				<ThemedText style={{ marginBottom: 16 }}>
					Trending Repositories from GitHub:
				</ThemedText>
				<RepoList />
			</Collapsible>
		</ParallaxScrollView>
	)
}
