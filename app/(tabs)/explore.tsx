import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Fonts } from "@/constants/theme";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { styles } from "../../css/styles";

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
    name: string;
    stargazers_count: number;
    forks_count: number;
    html_url: string;
    description?: string;
  };
}

const RepoItem = ({ repo }: RepoItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ThemedView
      style={{
        marginVertical: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
      }}
    >
      <ThemedText
        type="defaultSemiBold"
        style={{ fontSize: 16, marginBottom: 4 }}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        📁 {repo.name} ⭐ {repo.stargazers_count} 🍴 {repo.forks_count}
      </ThemedText>

      {isExpanded && (
        <ThemedView style={{ marginTop: 8, paddingLeft: 12 }}>
          {repo.description && (
            <ThemedText style={{ marginBottom: 8, fontStyle: "italic" }}>
              {repo.description}
            </ThemedText>
          )}
          <ExternalLink href={repo.html_url as any}>
            <ThemedText type="link" style={{ color: "#007AFF" }}>
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

  const handleRetry = async () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      // Add a small delay before retrying to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      fetchRepos(true);
    }
  };

  useEffect(() => {
    fetchRepos();
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
      {repos.map((repo, index) => (
        <RepoItem key={repo.id || index} repo={repo} />
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
