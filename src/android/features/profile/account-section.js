/**
 * Android Account section: Google Sign-In (OAuth only) with Firestore user
 * record + preference sync status. Rendered at the top of the Profile tab
 * under the "Account" label.
 * @module src/android/features/profile/account-section
 */
import {Pressable, Text, View} from "react-native";
import {signInWithGoogle, signOutGoogle} from "../../../services/firebase/google-auth";
import {useAuthStore} from "../../../shared/store/auth-store";
import {usePreferencesSyncStore} from "../../../shared/store/preferences-sync-store";

const syncLabel = {
  signedOut: "Signed out",
  syncing: "Syncing preferences…",
  synced: "Preferences up to date",
  error: "Sync failed — will retry when the connection returns",
};

export function AccountSection() {
  const {status, user, isSigningIn, error, setSigningIn, setError, clearError} = useAuthStore();
  const {syncStatus, syncError} = usePreferencesSyncStore();

  const handleSignIn = async () => {
    clearError();
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (signInError) {
      if (signInError?.code !== "cancelled") {
        setError(signInError?.message ?? "Sign-in failed. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    clearError();
    setSigningIn(true);
    try {
      await signOutGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <View>
      <Text className="mb-1 text-[11px] font-bold uppercase tracking-[1.2px] text-muted mobile:mb-2 mobile:text-[12px] tablet:text-[12px] desktop:mb-3 desktop:text-[13px]">
        Account
      </Text>

      <View className="rounded-[20px] border border-line bg-surface p-2 tablet:p-3 desktop:p-4">
        {status === "loading" ? (
          <Text className="py-1 text-[14px] text-muted">Checking account…</Text>
        ) : null}

        {status === "signedOut" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
            disabled={isSigningIn}
            onPress={handleSignIn}
            className={`flex-row items-center justify-between gap-3 py-1 ${isSigningIn ? "opacity-50" : ""}`}
          >
            <View className="flex-1">
              <Text className="text-[16px] text-ink">Sign in with Google</Text>
              <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">
                Sync your preferences across devices
              </Text>
            </View>
            <Text className="text-[14px] text-accent">{isSigningIn ? "Signing in…" : "↦"}</Text>
          </Pressable>
        ) : null}

        {status === "signedIn" && user ? (
          <View>
            <View className="py-1">
              <Text className="text-[16px] text-ink">{user.displayName ?? "Signed in"}</Text>
              {user.email ? (
                <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">{user.email}</Text>
              ) : null}
              <Text className="mt-1 text-[13px] leading-[18px] text-muted">
                {syncStatus === "error" ? (syncError ?? syncLabel.error) : syncLabel[syncStatus]}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              disabled={isSigningIn}
              onPress={handleSignOut}
              className={`mt-2 border-t border-line pt-2 ${isSigningIn ? "opacity-50" : ""}`}
            >
              <Text className="py-1 text-[16px] text-accent">
                {isSigningIn ? "Signing out…" : "Sign out"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {error ? <Text className="mt-2 text-[13px] leading-[18px] text-muted">{error}</Text> : null}
      </View>
    </View>
  );
}

export default AccountSection;
