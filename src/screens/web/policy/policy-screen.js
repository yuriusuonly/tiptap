/**
 * Web Policy page (Privacy Policy). Scrollable legal content.
 * @module src/screens/web/policy/policy-screen
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

export function PolicyScreen() {
  return (
    <>
      <Head>
        <title>Policy — {APP_NAME}</title>
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

            <Text className="mt-6 text-[28px] font-bold leading-[34px] text-ink">Policy</Text>
            <Text className="mt-2 text-[13px] leading-[18px] text-faint">
              Effective date: {EFFECTIVE_DATE} · Contact: {CONTACT_EMAIL}
            </Text>
            <P>
              This Policy explains how {APP_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
              information when you use the {APP_NAME} website and Android application (the &quot;Service&quot;). By using the
              Service, you agree to this Policy.
            </P>

            <Section title="1. Audience (13+)">
              <P>
                The Service is intended for users <Text className="font-semibold text-ink">13 years of age and older</Text>.
                We do not knowingly collect personal information from children under 13. If you believe a child under 13 has
                provided personal information, contact us at {CONTACT_EMAIL} and we will take appropriate steps to delete it.
              </P>
            </Section>

            <Section title="2. Information We Collect">
              <Bullet>
                <Text className="font-semibold text-ink">Account information (Android, when you sign in).</Text> If you sign in
                with Google (via Firebase Authentication), we receive and store information such as your Google account
                identifier, display name, email address, and profile photo URL as provided by Google, to create and manage your
                account.
              </Bullet>
              <Bullet>
                <Text className="font-semibold text-ink">Account data and sync.</Text> When signed in, we store and sync certain
                data to your account in Google Cloud Firestore (e.g., your user profile record and app preferences such as
                theme settings) so your experience can be consistent across sessions and devices. Sync behavior follows how the
                app is implemented.
              </Bullet>
              <Bullet>
                <Text className="font-semibold text-ink">Purchases (Google Play).</Text> If you make a{" "}
                <Text className="font-semibold text-ink">one-time in-app purchase</Text> through Google Play to unlock the app
                without ads, the transaction is processed by Google Play. We may receive purchase or entitlement information
                (such as purchase state or product identifiers) needed to confirm and restore your unlock; we do not receive
                your full payment card details.
              </Bullet>
              <Bullet>
                <Text className="font-semibold text-ink">Advertising (Google AdMob, rewarded ads).</Text> The Service may
                display <Text className="font-semibold text-ink">rewarded advertisements</Text> provided by Google AdMob. Ad
                providers may collect or receive information such as device identifiers (e.g., advertising ID), IP address,
                approximate location, app interaction and ad performance data, and diagnostics or similar technologies, to
                serve, measure, and improve ads and to prevent fraud, subject to their own policies and your device or Google
                settings.
              </Bullet>
              <Bullet>
                <Text className="font-semibold text-ink">Notifications (if enabled).</Text> If push notifications are enabled
                (e.g., via Firebase Cloud Messaging), we may process a device or registration token and related technical data
                to deliver notifications.
              </Bullet>
              <Bullet>
                <Text className="font-semibold text-ink">Device and usage information.</Text> We and our service providers may
                collect technical information (such as device or app version, logs, and diagnostics) to operate, secure, and
                improve the Service.
              </Bullet>
            </Section>

            <Section title="3. How We Use Information">
              <P>
                We use information to provide and maintain the Service; authenticate you and sync your account and preferences;
                process and restore your ad-removal purchase; display and measure rewarded ads (where applicable) and provide
                rewards or entitlements as implemented; send notifications you opt into (if enabled); monitor reliability and
                prevent abuse or fraud; and comply with legal obligations.
              </P>
            </Section>

            <Section title="4. Sharing and Third-Party Services">
              <P>We do <Text className="font-semibold text-ink">not sell</Text> your personal information. We share information with service providers that help operate the Service, including:</P>
              <Bullet><Text className="font-semibold text-ink">Google Firebase</Text> (Authentication, Cloud Firestore, Cloud Messaging, and/or Hosting) — to authenticate users, store and sync data, deliver notifications, and host web content.</Bullet>
              <Bullet><Text className="font-semibold text-ink">Google AdMob</Text> — to serve and measure rewarded ads.</Bullet>
              <Bullet><Text className="font-semibold text-ink">Google Play</Text> — to process and validate in-app purchases.</Bullet>
              <P>These providers process data under their own terms and privacy policies. Their handling of data (including advertising identifiers and ad personalization) may be controlled by their policies and your Google or device settings.</P>
            </Section>

            <Section title="5. Your Choices and Controls">
              <Bullet><Text className="font-semibold text-ink">Account &amp; sync.</Text> You can sign in or out on Android. Account deletion (where available in the app) is intended to remove your account and synced data as implemented; you may also contact us to request assistance.</Bullet>
              <Bullet><Text className="font-semibold text-ink">Ads &amp; ad removal.</Text> You may choose to view rewarded ads where offered. You may purchase the <Text className="font-semibold text-ink">one-time remove-ads unlock</Text> via Google Play (where available) to use the app without ads as implemented.</Bullet>
              <Bullet><Text className="font-semibold text-ink">Device/Google settings.</Text> You can manage ad personalization, reset or limit the advertising ID, and control permissions and notifications in your device and Google account settings.</Bullet>
            </Section>

            <Section title="6. Data Retention and Security">
              <P>We retain information as needed to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements. We use reasonable measures to protect information, but no method of transmission or storage is completely secure.</P>
            </Section>

            <Section title="7. International Processing">
              <P>Our providers may process information on servers located outside your country. By using the Service, you understand information may be transferred and processed internationally as described in this Policy and provider policies.</P>
            </Section>

            <Section title="8. Changes to This Policy">
              <P>We may update this Policy from time to time. We will post the updated version with a revised effective date. Continued use after changes means you accept the updated Policy.</P>
            </Section>

            <Section title="9. Contact">
              <P>Questions or requests: <Text className="font-semibold text-ink">{CONTACT_EMAIL}</Text>.</P>
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

export default PolicyScreen;
