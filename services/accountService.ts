import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  discordId?: string;
  isLoggedIn: boolean;
  loginMethod: "discord" | "anonymous";
  subscribedRepos: SubscribedRepo[];
  subscribedPackages: SubscribedPackage[];
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
}

export interface SubscribedRepo {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language?: string;
  subscribedAt: string;
  lastUpdated: string;
}

export interface SubscribedPackage {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  npm_url: string;
  downloads: {
    weekly: number;
    monthly: number;
  };
  subscribedAt: string;
  lastUpdated: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    repoUpdates: boolean;
    trendingPackages: boolean;
    weeklyDigest: boolean;
  };
  defaultSort: "stars" | "forks" | "name" | "updated";
  exploreView: "grid" | "list";
  discoverView: "grid" | "list";
}

const STORAGE_KEYS = {
  USER_ACCOUNT: "involvex_user_account",
  SUBSCRIBED_REPOS: "involvex_subscribed_repos",
  SUBSCRIBED_PACKAGES: "involvex_subscribed_packages",
  USER_PREFERENCES: "involvex_user_preferences",
};

// Default user account
const createDefaultAccount = (): UserAccount => ({
  id: generateId(),
  username: "Guest User",
  isLoggedIn: false,
  loginMethod: "anonymous",
  subscribedRepos: [],
  subscribedPackages: [],
  preferences: {
    theme: "system",
    notifications: {
      repoUpdates: true,
      trendingPackages: true,
      weeklyDigest: false,
    },
    defaultSort: "stars",
    exploreView: "list",
    discoverView: "grid",
  },
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
});

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Account service functions
export const accountService = {
  // Get current user account
  async getUserAccount(): Promise<UserAccount> {
    try {
      const accountData = await AsyncStorage.getItem(STORAGE_KEYS.USER_ACCOUNT);
      if (accountData) {
        return JSON.parse(accountData);
      }
      // Return default account if none exists
      const defaultAccount = createDefaultAccount();
      await this.saveUserAccount(defaultAccount);
      return defaultAccount;
    } catch (error) {
      console.error("Error getting user account:", error);
      return createDefaultAccount();
    }
  },

  // Save user account
  async saveUserAccount(account: UserAccount): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_ACCOUNT,
        JSON.stringify(account),
      );
    } catch (error) {
      console.error("Error saving user account:", error);
      throw error;
    }
  },

  // Update user account
  async updateUserAccount(updates: Partial<UserAccount>): Promise<UserAccount> {
    try {
      const currentAccount = await this.getUserAccount();
      const updatedAccount = {
        ...currentAccount,
        ...updates,
        lastLoginAt: new Date().toISOString(),
      };
      await this.saveUserAccount(updatedAccount);
      return updatedAccount;
    } catch (error) {
      console.error("Error updating user account:", error);
      throw error;
    }
  },

  // Login with Discord
  async loginWithDiscord(discordUser: {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
  }): Promise<UserAccount> {
    try {
      const account = await this.updateUserAccount({
        discordId: discordUser.id,
        username: discordUser.username,
        email: discordUser.email,
        avatar: discordUser.avatar,
        isLoggedIn: true,
        loginMethod: "discord",
        lastLoginAt: new Date().toISOString(),
      });
      return account;
    } catch (error) {
      console.error("Error logging in with Discord:", error);
      throw error;
    }
  },

  // Logout
  async logout(): Promise<UserAccount> {
    try {
      const defaultAccount = createDefaultAccount();
      await this.saveUserAccount(defaultAccount);
      return defaultAccount;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },

  // Subscribe to a repository
  async subscribeToRepo(
    repo: Omit<SubscribedRepo, "subscribedAt" | "lastUpdated">,
  ): Promise<UserAccount> {
    try {
      const account = await this.getUserAccount();
      const existingIndex = account.subscribedRepos.findIndex(
        r => r.id === repo.id || r.fullName === repo.fullName,
      );

      const subscribedRepo: SubscribedRepo = {
        ...repo,
        subscribedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing subscription
        account.subscribedRepos[existingIndex] = {
          ...account.subscribedRepos[existingIndex],
          ...subscribedRepo,
        };
      } else {
        // Add new subscription
        account.subscribedRepos.push(subscribedRepo);
      }

      await this.saveUserAccount(account);
      return account;
    } catch (error) {
      console.error("Error subscribing to repo:", error);
      throw error;
    }
  },

  // Unsubscribe from a repository
  async unsubscribeFromRepo(repoId: string): Promise<UserAccount> {
    try {
      const account = await this.getUserAccount();
      account.subscribedRepos = account.subscribedRepos.filter(
        repo => repo.id !== repoId && repo.fullName !== repoId,
      );
      await this.saveUserAccount(account);
      return account;
    } catch (error) {
      console.error("Error unsubscribing from repo:", error);
      throw error;
    }
  },

  // Subscribe to a package
  async subscribeToPackage(
    pkg: Omit<SubscribedPackage, "subscribedAt" | "lastUpdated">,
  ): Promise<UserAccount> {
    try {
      const account = await this.getUserAccount();
      const existingIndex = account.subscribedPackages.findIndex(
        p => p.id === pkg.id || p.name === pkg.name,
      );

      const subscribedPackage: SubscribedPackage = {
        ...pkg,
        subscribedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing subscription
        account.subscribedPackages[existingIndex] = {
          ...account.subscribedPackages[existingIndex],
          ...subscribedPackage,
        };
      } else {
        // Add new subscription
        account.subscribedPackages.push(subscribedPackage);
      }

      await this.saveUserAccount(account);
      return account;
    } catch (error) {
      console.error("Error subscribing to package:", error);
      throw error;
    }
  },

  // Unsubscribe from a package
  async unsubscribeFromPackage(packageId: string): Promise<UserAccount> {
    try {
      const account = await this.getUserAccount();
      account.subscribedPackages = account.subscribedPackages.filter(
        pkg => pkg.id !== packageId && pkg.name !== packageId,
      );
      await this.saveUserAccount(account);
      return account;
    } catch (error) {
      console.error("Error unsubscribing from package:", error);
      throw error;
    }
  },

  // Check if user is subscribed to a repo
  async isSubscribedToRepo(repoId: string): Promise<boolean> {
    try {
      const account = await this.getUserAccount();
      return account.subscribedRepos.some(
        repo => repo.id === repoId || repo.fullName === repoId,
      );
    } catch (error) {
      console.error("Error checking repo subscription:", error);
      return false;
    }
  },

  // Check if user is subscribed to a package
  async isSubscribedToPackage(packageId: string): Promise<boolean> {
    try {
      const account = await this.getUserAccount();
      return account.subscribedPackages.some(
        pkg => pkg.id === packageId || pkg.name === packageId,
      );
    } catch (error) {
      console.error("Error checking package subscription:", error);
      return false;
    }
  },

  // Update user preferences
  async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<UserAccount> {
    try {
      const account = await this.getUserAccount();
      const updatedAccount = {
        ...account,
        preferences: {
          ...account.preferences,
          ...preferences,
        },
      };
      await this.saveUserAccount(updatedAccount);
      return updatedAccount;
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  },

  // Get all subscribed repos
  async getSubscribedRepos(): Promise<SubscribedRepo[]> {
    try {
      const account = await this.getUserAccount();
      return account.subscribedRepos;
    } catch (error) {
      console.error("Error getting subscribed repos:", error);
      return [];
    }
  },

  // Get all subscribed packages
  async getSubscribedPackages(): Promise<SubscribedPackage[]> {
    try {
      const account = await this.getUserAccount();
      return account.subscribedPackages;
    } catch (error) {
      console.error("Error getting subscribed packages:", error);
      return [];
    }
  },

  // Clear all data (for testing or reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_ACCOUNT,
        STORAGE_KEYS.SUBSCRIBED_REPOS,
        STORAGE_KEYS.SUBSCRIBED_PACKAGES,
        STORAGE_KEYS.USER_PREFERENCES,
      ]);
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  },
};

export default accountService;
