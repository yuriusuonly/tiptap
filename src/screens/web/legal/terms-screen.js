/**
 * Web Terms of Service page. Scrollable legal content.
 * @module src/screens/web/legal/terms-screen
 */
import Head from "expo-router/head";
import {Link} from "expo-router";
import {Pressable, ScrollView, Text, View} from "react-native";
import {APP_NAME} from "../../../constants/configuration";

const EFFECTIVE_DATE = "November 9, 2026";
const CONTACT_EMAIL = "yuriusu.dev@gmail.com";

function Section({title, children}) {
  return (
    <View className="mt-6">
      <Text className="text-[17px] font-semibold leading-[24px] text-ink">{title}</Text>
      <View className="mt-2 gap-2">{children}</View>
    </View>
  );
}

function P({children}) {
  return <Text className="text-[15px] leading-[22px] text-muted">{children}</Text>;
}

function Bullet({children}) {
  return (
    <View className="flex-row gap-2">
      <Text className="text-[15px] leading-[22px] text-muted">•</Text>
      <Text className="flex-1 text-[15px] leading-[22px] text-muted">{children}</Text>
    </View>
  );
}

export function TermsScreen() {
  return (
    <>
      <Head>
        <title>Terms — {APP_NAME}</title>
      </Head>
      <View className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow items-center px-4 py-8 mobile:px-5 tablet:px-8 desktop:px-12"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[720px]">
            <Link href="/" asChild>
              <Pressable accessibilityRole="link" accessibilityLabel={`Back to ${APP_NAME}`}>
                <Text className="text-[14px] font-medium leading-5 text-accent">← Back to {APP_NAME}</Text>
              </Pressable>
            </Link>

            <Text className="mt-6 text-[28px] font-bold leading-[34px] text-ink">Terms</Text>
            <Text className="mt-2 text-[13px] leading-[18px] text-faint">
              Effective date: {EFFECTIVE_DATE} · Contact: {CONTACT_EMAIL}
            </Text>
            <P>
              By accessing or using {APP_NAME} (the &quot;Service&quot;), you agree to these Terms. If you do not agree, do not
              use the Service.
            </P>

            <Section title="1. Eligibility (13+)">
              <P>
                You must be <Text className="font-semibold text-ink">at least 13 years old</Text> to use the Service. By using
                the Service, you represent that you meet this requirement.
              </P>
            </Section>

            <Section title="2. The Service">
              <P>
                {APP_NAME} provides an experience centered on browsing AI-generated short titles and text content (features may
                vary by platform and may change during early preview). We may modify, suspend, or discontinue any part of the
                Service at any time.
              </P>
            </Section>

            <Section title="3. Accounts (Android)">
              <P>
                Some features require signing in with <Text className="font-semibold text-ink">Google</Text>. You are
                responsible for your account and for maintaining the security of your device and Google account. You agree to
                provide accurate information and to use the Service lawfully.
              </P>
            </Section>

            <Section title="4. Account Sync">
              <P>
                When signed in, certain data (such as your profile and preferences, e.g., theme settings) may be{" "}
                <Text className="font-semibold text-ink">stored and synced</Text> to your account (via Firebase/Firestore) to
                keep your experience consistent. You are responsible for understanding that synced data is associated with your
                account.
              </P>
            </Section>

            <Section title="5. Rewarded Advertisements (Google AdMob)">
              <P>
                The Service may offer <Text className="font-semibold text-ink">rewarded ads</Text> through Google AdMob.
                Availability of ads and rewards is not guaranteed and may depend on region, device, inventory, eligibility, and
                third-party policies. You must not attempt to manipulate, abuse, or fraudulently obtain ad rewards.
              </P>
            </Section>

            <Section title="6. In-App Purchase: Remove Ads (Google Play)">
              <P>
                We may offer a <Text className="font-semibold text-ink">one-time in-app purchase</Text> through Google Play to{" "}
                <Text className="font-semibold text-ink">unlock the app without ads</Text>. Purchases are processed by Google
                Play and subject to Google Play&apos;s terms and policies (including payment, billing, and any refund handling
                administered by Google Play). Entitlements and unlock status are provided &quot;as implemented&quot; and may
                require a valid purchase record and/or restore where supported.
              </P>
            </Section>

            <Section title="7. Acceptable Use">
              <P>You agree not to:</P>
              <Bullet>misuse the Service or interfere with or disrupt it;</Bullet>
              <Bullet>attempt unauthorized access;</Bullet>
              <Bullet>reverse engineer where prohibited by law;</Bullet>
              <Bullet>use the Service for unlawful, harmful, or abusive purposes; or</Bullet>
              <Bullet>circumvent ads, purchases, security, or access controls.</Bullet>
            </Section>

            <Section title="8. Intellectual Property and Content">
              <P>
                The Service, including its design and software (excluding third-party components), is owned by us or our
                licensors and protected by applicable laws. <Text className="font-semibold text-ink">AI-generated content</Text>{" "}
                is provided for informational or entertainment purposes and may be inaccurate, incomplete, or inappropriate; use
                it at your own discretion.
              </P>
            </Section>

            <Section title="9. Third-Party Services">
              <P>
                The Service relies on third parties (including <Text className="font-semibold text-ink">Google Firebase, Google
                AdMob, and Google Play</Text>). Your use of those services may be subject to their terms and policies, and we
                are not responsible for third-party services.
              </P>
            </Section>

            <Section title="10. Disclaimers">
              <P>
                THE SERVICE IS PROVIDED <Text className="font-semibold text-ink">&quot;AS IS&quot;</Text> AND{" "}
                <Text className="font-semibold text-ink">&quot;AS AVAILABLE&quot;</Text> WITHOUT WARRANTIES OF ANY KIND, EXPRESS
                OR IMPLIED, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
              </P>
            </Section>

            <Section title="11. Limitation of Liability">
              <P>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF THE
                SERVICE.
              </P>
            </Section>

            <Section title="12. Termination">
              <P>
                We may suspend or terminate access to the Service if you violate these Terms or if necessary to protect the
                Service or others. You may stop using the Service at any time.
              </P>
            </Section>

            <Section title="13. Changes to Terms">
              <P>
                We may update these Terms from time to time. Continued use after changes become effective constitutes acceptance
                of the updated Terms.
              </P>
            </Section>

            <Section title="14. Contact">
              <P>Questions: <Text className="font-semibold text-ink">{CONTACT_EMAIL}</Text>.</P>
            </Section>

            <View className="mt-10 pb-4">
              <Text className="text-[12px] leading-[17px] text-faint">
                This document is provided for general informational purposes and is not legal advice.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

export default TermsScreen;
