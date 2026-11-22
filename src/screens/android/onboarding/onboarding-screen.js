/**
 * Android first-time install login gate: shown once before the main app.
 * Transparent background. Offers Google Sign-In or continuing without an
 * account; completing either path persists the first-install flag via the
 * onboarding store.
 * @module src/screens/android/onboarding/onboarding-screen
 */
import {View} from "react-native";
import LogoIcon from "../../../assets/icons/icon.svg";
import {Icon} from "../../../components/icon";
import {NativeButton, NativeText} from "../../../components/ui";
import {Text} from "../../../components/text";
import {APP_NAME} from "../../../constants/configuration";
import {signInWithGoogle} from "../../../services/firebase/google-auth";
import {useAuthStore} from "../../../store/auth-store";
import {useOnboardingStore} from "../../../store/onboarding-store";
import {showToast} from "../../../store/toast-store";

const ACTION_FAILED_MESSAGE = "Something went wrong";

export function OnboardingScreen() {
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const {isSigningIn, setSigningIn, clearError} = useAuthStore();

  const handleContinue = () => {
    completeOnboarding();
  };

  const handleSignIn = async () => {
    if (isSigningIn) return;
    clearError();
    setSigningIn(true);
    try {
      await signInWithGoogle();
      completeOnboarding();
    } catch (signInError) {
      if (signInError?.code !== "cancelled") {
        showToast(ACTION_FAILED_MESSAGE);
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-transparent px-4 mobile:px-5 tablet:px-8 desktop:px-12">
      <View className="w-full max-w-[420px] items-center">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-[20px] bg-surface/80">
          <Icon as={LogoIcon} size={36} accessibilityLabel={`${APP_NAME} logo`} />
        </View>

        <NativeText role="displaySmall" weight="700" textAlign="center">
          {APP_NAME}
        </NativeText>
        <View className="mt-2">
          <NativeText role="bodyLarge" color="muted" textAlign="center">
            Sign in to sync your preferences across devices, or continue without an account.
          </NativeText>
        </View>

        <View className="mt-8 w-full gap-3">
          <NativeButton
            label={isSigningIn ? "Signing in…" : "Sign in with Google"}
            variant="filled"
            disabled={isSigningIn}
            onPress={handleSignIn}
            accessibilityLabel="Sign in with Google"
          />

          <NativeButton
            label="Continue without signing in"
            variant="text"
            disabled={isSigningIn}
            onPress={handleContinue}
            accessibilityLabel="Continue without signing in"
          />
        </View>
      </View>
    </View>
  );
}

export default OnboardingScreen;
