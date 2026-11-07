/**
 * Android Account section: Google Sign-In (OAuth only) with Firestore user
 * record + preference sync. Each action shows its own circular progress.
 * Every failed response (sign-in/sign-out/account deletion/sync) surfaces
 * via the same toast; there are no inlined errors. Identity shows name/email (+photo).
 * @module src/android/screens/profile/account-section
 */
import {useEffect, useState} from "react";
import {Image, Pressable, Text, View} from "react-native";
import {deleteAuthUser, signInWithGoogle, signOutGoogle} from "../../../services/firebase/google-auth";
import {deleteUserData} from "../../../services/firebase/user-profile";
import GoogleIcon from "../../../shared/assets/icons/google.svg";
import {CircularProgress} from "../../../shared/components/circular-progress";
import {Icon} from "../../../shared/components/icon";
import {useAuthStore} from "../../../shared/store/auth-store";
import {usePreferencesSyncStore} from "../../../shared/store/preferences-sync-store";

export const ACTION_FAILED_MESSAGE = "Something went wrong";

export function AccountSection({onActionFailed}) {
  const {status, user, isSigningIn, setSigningIn, clearError} = useAuthStore();
  const {syncStatus, syncError} = usePreferencesSyncStore();
  const [photoFailed, setPhotoFailed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
    setConfirmingDelete(false);
  }, [user?.uid]);

  // Surface background preference-sync failures through the shared toast
  // (fired only when a new error value arrives).
  useEffect(() => {
    if (syncError) {
      onActionFailed?.(ACTION_FAILED_MESSAGE);
    }
  }, [syncError, onActionFailed]);

  const handleSignIn = async () => {
    clearError();
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (signInError) {
      if (signInError?.code !== "cancelled") {
        onActionFailed?.(ACTION_FAILED_MESSAGE);
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
    } catch {
      onActionFailed?.(ACTION_FAILED_MESSAGE);
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
      try {
        await signOutGoogle();
      } catch {
        // Best effort: account is already deleted.
      }
      setConfirmingDelete(false);
    } catch {
      onActionFailed?.(ACTION_FAILED_MESSAGE);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View>
      <Text className="mb-1 text-[11px] font-bold uppercase tracking-[1.2px] text-muted mobile:mb-2 mobile:text-[12px] tablet:text-[12px] desktop:mb-3 desktop:text-[13px]">
        Account
      </Text>

      <View className="rounded-[20px] border border-line bg-surface p-2 tablet:p-3 desktop:p-4">
        {status === "loading" ? (
          <CircularProgress label="Checking account…" />
        ) : status === "signedOut" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
            disabled={isSigningIn}
            onPress={handleSignIn}
            className={`flex-row items-center gap-3 py-1 ${isSigningIn ? "opacity-50" : ""}`}
          >
            <View className="h-10 w-10 items-center justify-center overflow-hidden">
              {isSigningIn ? (
                <CircularProgress />
              ) : (
                <Icon as={GoogleIcon} size={24} accessibilityLabel="Google" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[16px] text-ink">{isSigningIn ? "Signing in…" : "Sign in with Google"}</Text>
              <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">
                Sync your preferences across devices
              </Text>
            </View>
            <Text className="text-[14px] text-accent">↦</Text>
          </Pressable>
        ) : status === "signedIn" && user ? (
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
                {syncStatus === "syncing" ? (
                  <View className="mt-1 flex-row items-center gap-2">
                    <CircularProgress />
                    <Text className="text-[13px] leading-[18px] text-muted">Syncing preferences…</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              disabled={isSigningIn}
              onPress={handleSignOut}
              className={`mt-2 flex-row items-center justify-between border-t border-line pt-2 ${isSigningIn ? "opacity-50" : ""}`}
            >
              <Text className="py-1 text-[16px] text-accent">{isSigningIn ? "Signing out…" : "Sign out"}</Text>
              {isSigningIn ? <CircularProgress /> : null}
            </Pressable>
            {confirmingDelete ? (
              <View className="mt-2 border-t border-line pt-2">
                <Text className="text-[14px] leading-[20px] text-ink">
                  Delete your account and all synced data? This can&apos;t be undone.
                </Text>
                <View className="mt-2 flex-row items-center gap-5">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Confirm delete account"
                    disabled={isDeleting}
                    onPress={handleDelete}
                    className="flex-row items-center gap-2"
                  >
                    {isDeleting ? <CircularProgress /> : null}
                    <Text className="py-1 text-[14px] font-semibold text-cyan">
                      {isDeleting ? "Deleting…" : "Delete"}
                    </Text>
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
                className="border-t border-line pt-2"
              >
                <Text className="py-1 text-[14px] text-cyan">Delete account</Text>
              </Pressable>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default AccountSection;
