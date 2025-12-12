import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Fonts } from "@/constants/theme";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, View } from "react-native";
import { styles } from "../../css/styles";
import accountService, {
  type SubscribedRepo,
} from "../../services/accountService";

// Fetch repository data
const fetchInvolvexRepos = async () => {
  try {
    const apiRepo = "https://api.github.com/users/involvex/repos";
    const response = await fetch(apiRepo, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Chrome/143.0.0.0",
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded. Please try again later or add a GitHub token.",
        );
      }
      if (response.status === 404) {
        throw new Error("GitHub user not found.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const repos = await response.json();
    console.log("Fetched repos:", repos);
    return repos;
  } catch (error) {
    console.error("Error fetching repos:", error);
    throw error; // Re-throw to preserve error details
  }
};

// Repository item component
interface RepoItemProps {
  repo: {
    id: string;
    name: string;
    fullName: string;
    stargazers_count: number;
    forks_count: number;
    html_url: string;
    description?: string;
    owner: {
      login: string;
      avatar_url: string;
    };
  };
  isSubscribed: boolean;
  onToggleSubscription: (repo: any) => void;
}

const RepoItem = ({
  repo,
  isSubscribed,
  onToggleSubscription,
}: RepoItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ThemedView
      style={{
        marginVertical: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: isSubscribed
          ? "rgba(255,107,107,0.1)"
          : "rgba(0,0,0,0.05)",
        borderWidth: 1,
        borderColor: isSubscribed ? "#FF6B6B" : "rgba(0,0,0,0.1)",
      }}
    >
      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ThemedView style={{ flex: 1 }}>
          <ThemedText
            type="defaultSemiBold"
            style={{ fontSize: 16, marginBottom: 4 }}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            📁 {repo.name}
          </ThemedText>

          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              marginBottom: 8,
            }}
          >
            <ThemedText style={{ fontSize: 12, color: "#666" }}>
              ⭐ {repo.stargazers_count.toLocaleString()}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: "#666" }}>
              🍴 {repo.forks_count.toLocaleString()}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: "#666" }}>
              👤 {repo.owner.login}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <Button
          title={isSubscribed ? "❤️ Subscribed" : "🤍 Subscribe"}
          onPress={() => onToggleSubscription(repo)}
          color={isSubscribed ? "#FF6B6B" : "#007AFF"}
        />
      </ThemedView>

      {isExpanded && (
        <ThemedView
          style={{
            marginTop: 12,
            paddingLeft: 12,
            borderLeftWidth: 2,
            borderLeftColor: "rgba(0,0,0,0.1)",
          }}
        >
          {repo.description && (
            <ThemedText
              style={{
                marginBottom: 12,
                fontStyle: "italic",
                lineHeight: 20,
              }}
            >
              {repo.description}
            </ThemedText>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <Image
              source={{ uri: repo.owner.avatar_url }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
              }}
              contentFit="cover"
              transition={1000}
            />
            <ThemedText style={{ fontSize: 12, color: "#666" }}>
              by {repo.owner.login}
            </ThemedText>
          </View>

          <ExternalLink href={repo.html_url as any}>
            <ThemedText type="link" style={{ color: "#007AFF", fontSize: 14 }}>
              View on GitHub →
            </ThemedText>
          </ExternalLink>
        </ThemedView>
      )}
    </ThemedView>
  );
};

// Repository list component
const RepoList = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sortBy, setSortBy] = useState<"stars" | "forks" | "name" | "updated">(
    "stars",
  );
  const [subscribedRepos, setSubscribedRepos] = useState<Set<string>>(
    new Set(),
  );
  const cacheRef = useRef<any[] | null>(null);
  const maxRetries = 3;

  const fetchRepos = async (isRetry = false) => {
    // Return cached data if available and not retrying
    if (cacheRef.current && !isRetry) {
      setRepos(cacheRef.current);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchInvolvexRepos();
      cacheRef.current = data || [];
      setRepos(data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setRepos([]);
      cacheRef.current = null; // Clear cache on error
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribedRepos = async () => {
    try {
      const subscribed = await accountService.getSubscribedRepos();
      const repoIds = new Set(subscribed.map(repo => repo.id));
      setSubscribedRepos(repoIds);
    } catch (error) {
      console.error("Error loading subscribed repos:", error);
    }
  };

  const handleRetry = async () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      // Add a small delay before retrying to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      fetchRepos(true);
    }
  };

  const sortRepos = (repos: any[]) => {
    const sortedRepos = [...repos];
    switch (sortBy) {
      case "stars":
        return sortedRepos.sort(
          (a, b) => b.stargazers_count - a.stargazers_count,
        );
      case "forks":
        return sortedRepos.sort((a, b) => b.forks_count - a.forks_count);
      case "name":
        return sortedRepos.sort((a, b) => a.name.localeCompare(b.name));
      case "updated":
        return sortedRepos.sort(
          (a, b) =>
            new Date(b.updated_at || 0).getTime() -
            new Date(a.updated_at || 0).getTime(),
        );
      default:
        return sortedRepos;
    }
  };

  const handleToggleSubscription = async (repo: any) => {
    try {
      const repoId = repo.id.toString();
      const isCurrentlySubscribed = subscribedRepos.has(repoId);

      if (isCurrentlySubscribed) {
        // Unsubscribe
        await accountService.unsubscribeFromRepo(repoId);
        setSubscribedRepos(prev => {
          const newSet = new Set(prev);
          newSet.delete(repoId);
          return newSet;
        });
        Alert.alert("Unsubscribed", `You have unsubscribed from ${repo.name}`);
      } else {
        // Subscribe
        const subscribedRepo: Omit<
          SubscribedRepo,
          "subscribedAt" | "lastUpdated"
        > = {
          id: repoId,
          name: repo.name,
          fullName: repo.full_name || `${repo.owner.login}/${repo.name}`,
          description: repo.description,
          owner: repo.owner,
          html_url: repo.html_url,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
        };

        await accountService.subscribeToRepo(subscribedRepo);
        setSubscribedRepos(prev => new Set([...prev, repoId]));
        Alert.alert("Subscribed!", `You are now following ${repo.name}`);
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      Alert.alert("Error", "Failed to update subscription. Please try again.");
    }
  };

  useEffect(() => {
    fetchRepos();
    loadSubscribedRepos();
  }, []);

  if (loading) {
    return (
      <ThemedText style={{ textAlign: "center", marginVertical: 20 }}>
        Loading repositories...
      </ThemedText>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ alignItems: "center", marginVertical: 20 }}>
        <ThemedText
          style={{
            textAlign: "center",
            marginBottom: 16,
            color: "red",
          }}
        >
          Error loading repositories: {error}
        </ThemedText>
        {retryCount < maxRetries && (
          <ThemedView
            style={{
              backgroundColor: "#007AFF",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <ThemedText
              style={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
              onPress={handleRetry}
            >
              Retry ({retryCount}/{maxRetries})
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  }

  if (!repos || repos.length === 0) {
    return (
      <ThemedText style={{ textAlign: "center", marginVertical: 20 }}>
        No repositories found
      </ThemedText>
    );
  }

  return (
    <ThemedView>
      {/* Sort Options */}
      <ThemedView
        style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: "rgba(0,0,0,0.02)",
          borderRadius: 8,
        }}
      >
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
          Sort by:
        </ThemedText>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {(["stars", "forks", "name", "updated"] as const).map(sortOption => (
            <Button
              key={sortOption}
              title={sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
              onPress={() => setSortBy(sortOption)}
              color={sortBy === sortOption ? "#007AFF" : "#ccc"}
            />
          ))}
        </View>
      </ThemedView>

      {sortRepos(repos).map((repo, index) => (
        <RepoItem
          key={repo.id || index}
          repo={repo}
          isSubscribed={subscribedRepos.has(repo.id.toString())}
          onToggleSubscription={handleToggleSubscription}
        />
      ))}
    </ThemedView>
  );
};

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#000000ff", dark: "#000000ff" }}
      headerImage={
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Explore
        </ThemedText>
      </ThemedView>

      <Collapsible title="Repositories:">
        <ThemedText style={{ marginBottom: 16 }}>
          Involvex Repositories from GitHub:
        </ThemedText>
        <RepoList />
      </Collapsible>
    </ParallaxScrollView>
  );
}
