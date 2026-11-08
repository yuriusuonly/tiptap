/**
 * Android Account section: Google Sign-In (OAuth only) with Firestore user
 * record + preference sync. Each action shows its own circular progress.
 * Every failed response (sign-in/sign-out/account deletion/sync) surfaces
 * via the root-owned toast; there are no inlined errors. Delete account uses
 * the root-level custom confirmation dialog. Identity shows name/email (+photo).
 * @module src/screens/android/profile/account-section
 */
import {useEffect, useState} from "react";
import {Image, Pressable, Text, View} from "react-native";
import {deleteAuthUser, signInWithGoogle, signOutGoogle} from "../../../services/firebase/google-auth";
import {deleteUserData} from "../../../services/firebase/user-profile";
import GoogleIcon from "../../../assets/icons/google.svg";
import {CircularProgress} from "../../../components/circular-progress";
import {confirm} from "../../../components/confirm-dialog";
import {Icon} from "../../../components/icon";
import {useAuthStore} from "../../../store/auth-store";
import {usePreferencesSyncStore} from "../../../store/preferences-sync-store";
import {showToast} from "../../../store/toast-store";

export const ACTION_FAILED_MESSAGE = "Something went wrong";

export function AccountSection() {
  const {status, user, isSigningIn, setSigningIn, clearError} = useAuthStore();
  const {syncStatus, syncError} = usePreferencesSyncStore();
  const [photoFailed, setPhotoFailed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [user?.uid]);

  // Surface background preference-sync failures through the root toast
  // (fired only when a new error value arrives).
  useEffect(() => {
    if (syncError) {
      showToast(ACTION_FAILED_MESSAGE);
    }
  }, [syncError]);

  const handleSignIn = async () => {
    clearError();
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (signInError) {
      if (signInError?.code !== "cancelled") {
        showToast(ACTION_FAILED_MESSAGE);
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
      showToast(ACTION_FAILED_MESSAGE);
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
    } catch {
      showToast(ACTION_FAILED_MESSAGE);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = async () => {
    if (isDeleting || !user) return;
    const accepted = await confirm({
      title: "Delete account?",
      message: "Delete your account and all synced data? This can't be undone.",
      cancelLabel: "Cancel",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (accepted) {
      await handleDelete();
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete account"
              disabled={isDeleting}
              onPress={confirmDelete}
              className={`flex-row items-center justify-between border-t border-line pt-2 ${isDeleting ? "opacity-50" : ""}`}
            >
              <Text className="py-1 text-[14px] text-cyan">{isDeleting ? "Deleting…" : "Delete account"}</Text>
              {isDeleting ? <CircularProgress /> : null}
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default AccountSection;
