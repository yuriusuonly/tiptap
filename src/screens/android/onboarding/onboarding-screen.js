/**
 * Android first-time install login gate: shown once before the main app.
 * Transparent background. Offers Google Sign-In or continuing without an
 * account; completing either path persists the first-install flag via the
 * onboarding store.
 * @module src/screens/android/onboarding/onboarding-screen
 */
import {Pressable, Text, View} from "react-native";
import GoogleIcon from "../../../assets/icons/google.svg";
import LogoIcon from "../../../assets/icons/icon.svg";
import {CircularProgress} from "../../../components/circular-progress";
import {Icon} from "../../../components/icon";
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

        <Text className="text-center text-[28px] font-extrabold leading-[34px] tracking-[-0.6px] text-ink mobile:text-[32px] mobile:leading-[38px]">
          {APP_NAME}
        </Text>
        <Text className="mt-2 text-center text-[15px] leading-6 text-muted mobile:text-[16px]">
          Sign in to sync your preferences across devices, or continue without an account.
        </Text>

        <View className="mt-8 w-full gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
            disabled={isSigningIn}
            onPress={handleSignIn}
            className={`flex-row items-center justify-center gap-3 rounded-full border border-line bg-surface/90 px-5 py-3.5 ${
              isSigningIn ? "opacity-60" : ""
            }`}
          >
            <View className="h-6 w-6 items-center justify-center">
              {isSigningIn ? (
                <CircularProgress size={22} />
              ) : (
                <Icon as={GoogleIcon} size={22} accessibilityLabel="Google" />
              )}
            </View>
            <Text className="text-[15px] font-semibold text-ink">
              {isSigningIn ? "Signing in…" : "Sign in with Google"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue without signing in"
            disabled={isSigningIn}
            onPress={handleContinue}
            className={`items-center justify-center rounded-full px-5 py-3 ${
              isSigningIn ? "opacity-50" : ""
            }`}
          >
            <Text className="text-[14px] font-semibold text-faint">Continue without signing in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default OnboardingScreen;
