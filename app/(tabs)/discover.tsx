import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, View } from "react-native";
import { styles } from "../../css/styles";
import accountService, {
  type SubscribedRepo,
} from "../../services/accountService";

const fetchtrendingRepos = async () => {
  try {
    const apiRepo =
      "https://api.github.com/search/repositories?q=stars:%3E10+created=today&per_page=20&sort=stars&order=desc";
    const response = await fetch(apiRepo, {
      headers: {
        accept: "application/vnd.github.v3+json",
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

    const data = await response.json();
    console.log("Fetched repos data:", data);
    return data.items || [];
  } catch (error) {
    console.error("Error fetching repos:", error);
    throw error;
  }
};

// Fetch trending npm packages
const fetchTrendingPackages = async () => {
  try {
    const response = await fetch(
      "https://registry.npmjs.org/-/v1/search?text=react&size=20&quality=0.65&popularity=0.98&maintenance=0.5",
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.objects || [];
  } catch (error) {
    console.error("Error fetching npm packages:", error);
    throw error;
  }
};

// Utility function to truncate description with character limit
const truncateDescription = (description: string, maxLength = 120): string => {
  if (!description || description.length <= maxLength) {
    return description || "No description provided.";
  }
  const truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  return lastSpaceIndex > maxLength * 0.8
    ? truncated.substring(0, lastSpaceIndex) + "..."
    : truncated + "...";
};

interface RepoItemProps {
  repo: {
    id: string;
    name: string;
    full_name: string;
    stargazers_count: number;
    forks_count: number;
    html_url: string;
    description?: string;
    language: string;
    owner: {
      avatar_url: string;
      login: string;
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
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (repo.html_url) {
      try {
        Linking.openURL(repo.html_url);
      } catch (error) {
        console.error("Error opening URL:", error);
      }
    }
  };

  return (
    <ThemedView
      style={{
        marginVertical: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: isPressed
          ? "rgba(0,122,255,0.1)"
          : isSubscribed
            ? "rgba(255,107,107,0.1)"
            : "rgba(0,0,0,0.05)",
        borderWidth: 1,
        borderColor: isPressed
          ? "#007AFF"
          : isSubscribed
            ? "#FF6B6B"
            : "rgba(0,0,0,0.1)",
        transform: isPressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
      }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setIsPressed(false)}
    >
      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <ThemedView style={{ flex: 1 }}>
          <ThemedText
            type="defaultSemiBold"
            style={{
              fontSize: 16,
              marginBottom: 4,
              color: "#007AFF",
            }}
          >
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
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <ThemedText style={{ fontSize: 12 }}>
              ⭐ {repo.stargazers_count.toLocaleString()}
            </ThemedText>
            <ThemedText style={{ fontSize: 12 }}>
              🍴 {repo.forks_count.toLocaleString()}
            </ThemedText>
            {repo.language && (
              <ThemedText style={{ fontSize: 12 }}>
                📝 {repo.language}
              </ThemedText>
            )}
          </ThemedView>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Image
              source={{ uri: repo.owner.avatar_url }}
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
              }}
              contentFit="cover"
              transition={1000}
            />
            <ThemedText style={{ fontSize: 12, color: "gray" }}>
              {repo.owner.login}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <Button
          title={isSubscribed ? "❤️ Subscribed" : "🤍 Subscribe"}
          onPress={() => onToggleSubscription(repo)}
          color={isSubscribed ? "#FF6B6B" : "#007AFF"}
        />
      </ThemedView>
    </ThemedView>
  );
};

interface PackageItemProps {
  pkg: {
    package: {
      name: string;
      description?: string;
      version: string;
      author?: {
        name?: string;
        email?: string;
      };
      repository?: {
        type: string;
        url: string;
      };
      homepage?: string;
      npm: string;
    };
    score?: {
      detail: {
        quality: number;
        popularity: number;
        maintenance: number;
      };
    };
    searchScore?: number;
  };
  isSubscribed: boolean;
  onToggleSubscription: (pkg: any) => void;
}

const PackageItem = ({
  pkg,
  isSubscribed,
  onToggleSubscription,
}: PackageItemProps) => {
  const handleViewNpm = () => {
    if (pkg.package.npm) {
      try {
        Linking.openURL(pkg.package.npm);
      } catch (error) {
        console.error("Error opening npm URL:", error);
      }
    }
  };

  const handleViewHomepage = () => {
    if (pkg.package.homepage) {
      try {
        Linking.openURL(pkg.package.homepage);
      } catch (error) {
        console.error("Error opening homepage:", error);
      }
    }
  };

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
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <ThemedView style={{ flex: 1 }}>
          <ThemedText
            type="defaultSemiBold"
            style={{
              fontSize: 16,
              marginBottom: 4,
              color: "#CB3837",
            }}
          >
            📦 {pkg.package.name}
          </ThemedText>
          <ThemedText
            style={{
              marginBottom: 8,
              fontSize: 12,
              color: "#666",
            }}
          >
            v{pkg.package.version}
          </ThemedText>
          <ThemedText style={{ marginBottom: 8, fontSize: 14, opacity: 0.8 }}>
            {truncateDescription(pkg.package.description || "", 120)}
          </ThemedText>

          {pkg.package.author && (
            <ThemedText
              style={{
                marginBottom: 8,
                fontSize: 12,
                color: "#666",
              }}
            >
              👤 by {pkg.package.author.name || pkg.package.author.email}
            </ThemedText>
          )}

          {pkg.score && (
            <ThemedView
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <ThemedText style={{ fontSize: 12 }}>
                ⭐ Quality: {Math.round(pkg.score.detail.quality * 100)}%
              </ThemedText>
              <ThemedText style={{ fontSize: 12 }}>
                🔥 Popularity: {Math.round(pkg.score.detail.popularity * 100)}%
              </ThemedText>
              <ThemedText style={{ fontSize: 12 }}>
                🔧 Maintenance: {Math.round(pkg.score.detail.maintenance * 100)}
                %
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView style={{ flexDirection: "row", gap: 8 }}>
            {pkg.package.homepage && (
              <Button
                title="Homepage"
                onPress={handleViewHomepage}
                color="#28a745"
              />
            )}
            <Button
              title="View on npm"
              onPress={handleViewNpm}
              color="#CB3837"
            />
          </ThemedView>
        </ThemedView>

        <Button
          title={isSubscribed ? "❤️ Subscribed" : "🤍 Subscribe"}
          onPress={() => onToggleSubscription(pkg)}
          color={isSubscribed ? "#FF6B6B" : "#007AFF"}
        />
      </ThemedView>
    </ThemedView>
  );
};

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
    if (cacheRef.current && !isRetry) {
      setRepos(cacheRef.current);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const reposArray = await fetchtrendingRepos();
      cacheRef.current = reposArray;
      setRepos(reposArray);
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setRepos([]);
      cacheRef.current = null;
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
        await accountService.unsubscribeFromRepo(repoId);
        setSubscribedRepos(prev => {
          const newSet = new Set(prev);
          newSet.delete(repoId);
          return newSet;
        });
        Alert.alert("Unsubscribed", `You have unsubscribed from ${repo.name}`);
      } else {
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

const PackageList = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribedPackages, setSubscribedPackages] = useState<Set<string>>(
    new Set(),
  );

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const packagesArray = await fetchTrendingPackages();
      setPackages(packagesArray);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribedPackages = async () => {
    try {
      const subscribed = await accountService.getSubscribedPackages();
      const packageIds = new Set(subscribed.map(pkg => pkg.id));
      setSubscribedPackages(packageIds);
    } catch (error) {
      console.error("Error loading subscribed packages:", error);
    }
  };

  const handleToggleSubscription = async (pkg: any) => {
    try {
      const packageId = pkg.package.name;
      const isCurrentlySubscribed = subscribedPackages.has(packageId);

      if (isCurrentlySubscribed) {
        await accountService.unsubscribeFromPackage(packageId);
        setSubscribedPackages(prev => {
          const newSet = new Set(prev);
          newSet.delete(packageId);
          return newSet;
        });
        Alert.alert(
          "Unsubscribed",
          `You have unsubscribed from ${pkg.package.name}`,
        );
      } else {
        const subscribedPackage = {
          id: packageId,
          name: pkg.package.name,
          version: pkg.package.version,
          description: pkg.package.description,
          author: pkg.package.author?.name,
          homepage: pkg.package.homepage,
          repository: pkg.package.repository?.url,
          npm_url: `https://www.npmjs.com/package/${pkg.package.name}`,
          downloads: {
            weekly: 0,
            monthly: 0,
          },
        };

        await accountService.subscribeToPackage(subscribedPackage);
        setSubscribedPackages(prev => new Set([...prev, packageId]));
        Alert.alert("Subscribed!", `You are now following ${pkg.package.name}`);
      }
    } catch (error) {
      console.error("Error toggling package subscription:", error);
      Alert.alert("Error", "Failed to update subscription. Please try again.");
    }
  };

  useEffect(() => {
    fetchPackages();
    loadSubscribedPackages();
  }, []);

  if (loading) {
    return (
      <ThemedText style={{ textAlign: "center", marginVertical: 20 }}>
        Loading npm packages...
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
          Error loading npm packages: {error}
        </ThemedText>
        <Button title="Retry" onPress={fetchPackages} color="#007AFF" />
      </ThemedView>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <ThemedText style={{ textAlign: "center", marginVertical: 20 }}>
        No npm packages found
      </ThemedText>
    );
  }

  return (
    <ThemedView>
      {packages.map((pkg, index) => (
        <PackageItem
          key={pkg.package.name || index}
          pkg={pkg}
          isSubscribed={subscribedPackages.has(pkg.package.name)}
          onToggleSubscription={handleToggleSubscription}
        />
      ))}
    </ThemedView>
  );
};

export default function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState<"repos" | "packages">("repos");

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
            fontFamily: "rounded",
          }}
        >
          Discover
        </ThemedText>
      </ThemedView>

      <ThemedView style={{ marginBottom: 16, flexDirection: "row", gap: 8 }}>
        <Button
          title="Trending Repos"
          onPress={() => setActiveTab("repos")}
          color={activeTab === "repos" ? "#007AFF" : "#ccc"}
        />
        <Button
          title="Trending Packages"
          onPress={() => setActiveTab("packages")}
          color={activeTab === "packages" ? "#007AFF" : "#ccc"}
        />
      </ThemedView>

      {activeTab === "repos" ? (
        <Collapsible title="Repositories:">
          <ThemedText style={{ marginBottom: 16 }}>
            Trending Repositories from GitHub:
          </ThemedText>
          <RepoList />
        </Collapsible>
      ) : (
        <Collapsible title="NPM Packages:">
          <ThemedText style={{ marginBottom: 16 }}>
            Trending NPM Packages:
          </ThemedText>
          <PackageList />
        </Collapsible>
      )}
    </ParallaxScrollView>
  );
}
