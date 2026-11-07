/**
 * Android Account section: Google Sign-In (OAuth only) with Firestore user
 * record + preference sync. Loading/error presentation is centralized in
 * `StateView`; the identity area shows the user's name and email only.
 * @module src/android/features/profile/account-section
 */
import {useEffect, useState} from "react";
import {Image, Pressable, Text, View} from "react-native";
import {deleteAuthUser, signInWithGoogle, signOutGoogle} from "../../../services/firebase/google-auth";
import {deleteUserData} from "../../../services/firebase/user-profile";
import {StateView} from "../../../shared/components/state-view";
import {useAuthStore} from "../../../shared/store/auth-store";
import {syncOnSignIn, usePreferencesSyncStore} from "../../../shared/store/preferences-sync-store";

export function AccountSection() {
  const {status, user, isSigningIn, error, setSigningIn, setError, clearError} = useAuthStore();
  const {syncStatus, syncError, setSyncStatus} = usePreferencesSyncStore();
  const [photoFailed, setPhotoFailed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
    setConfirmingDelete(false);
  }, [user?.uid]);

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

  const handleDelete = async () => {
    if (!user) return;
    clearError();
    setIsDeleting(true);
    try {
      await deleteUserData(user.uid);
      await deleteAuthUser();
      await signOutGoogle();
      setConfirmingDelete(false);
    } catch (deleteError) {
      setError(deleteError?.message ?? "Could not delete your account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetrySync = () => {
    if (user) void syncOnSignIn(user);
  };

  const handleDismiss = () => {
    clearError();
    if (syncError) setSyncStatus("synced");
  };

  const isLoading =
    status === "loading" ||
    isSigningIn ||
    isDeleting ||
    (status === "signedIn" && syncStatus === "syncing");
  const loadingText =
    status === "loading"
      ? "Checking account…"
      : isDeleting
        ? "Deleting account…"
        : isSigningIn && status === "signedOut"
          ? "Signing in…"
          : isSigningIn
            ? "Signing out…"
            : "Syncing preferences…";
  const errorMessage = syncError ?? error;

  return (
    <View>
      <Text className="mb-1 text-[11px] font-bold uppercase tracking-[1.2px] text-muted mobile:mb-2 mobile:text-[12px] tablet:text-[12px] desktop:mb-3 desktop:text-[13px]">
        Account
      </Text>

      <View className="rounded-[20px] border border-line bg-surface p-2 tablet:p-3 desktop:p-4">
        <StateView
          isLoading={isLoading}
          loadingText={loadingText}
          error={errorMessage}
          onRetry={syncError ? handleRetrySync : null}
          onDismiss={errorMessage ? handleDismiss : null}
        >
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
            <View className="flex-row items-center gap-3 py-1">
              <View className="relative h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-raised">
                <Text className="text-[16px] font-semibold text-accent">
                  {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
                </Text>
                {user.photoURL && !photoFailed ? (
                  <Image
                    source={{uri: user.photoURL}}
                    onError={() => setPhotoFailed(true)}
                    accessibilityLabel={`${user.displayName ?? "Account"} profile photo`}
                    className="absolute inset-0 h-10 w-10"
                  />
                ) : null}
              </View>
              <View className="flex-1">
                <Text className="text-[16px] text-ink">{user.displayName ?? "Signed in"}</Text>
                {user.email ? (
                  <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">{user.email}</Text>
                ) : null}
              </View>
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
            {confirmingDelete ? (
              <View className="mt-2 border-t border-line pt-2">
                <Text className="text-[14px] leading-[20px] text-ink">
                  Delete your account and all synced data? This can&apos;t be undone.
                </Text>
                <View className="mt-2 flex-row gap-5">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Confirm delete account"
                    disabled={isDeleting}
                    onPress={handleDelete}
                  >
                    <Text className="py-1 text-[14px] font-semibold text-cyan">Delete</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel delete account"
                    disabled={isDeleting}
                    onPress={() => setConfirmingDelete(false)}
                  >
                    <Text className="py-1 text-[14px] text-muted">Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete account"
                disabled={isDeleting}
                onPress={() => setConfirmingDelete(true)}
                className={`border-t border-line pt-2 ${isDeleting ? "opacity-50" : ""}`}
              >
                <Text className="py-1 text-[14px] text-cyan">Delete account</Text>
              </Pressable>
            )}
          </View>
        ) : null}
        </StateView>
      </View>
    </View>
  );
}

export default AccountSection;
