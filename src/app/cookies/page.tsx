import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy | Zomee",
  description: "How and why Zomee uses cookies and similar technologies, and how you can control them.",
};

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies",
    body: (
      <p>
        Cookies are small text files placed on your device when you visit a website. They are widely used to make sites
        work, or work more efficiently, and to provide reporting information. Similar technologies include local
        storage, session storage, and pixels, which we refer to collectively as &quot;cookies&quot; in this policy.
      </p>
    ),
  },
  {
    id: "how-we-use-cookies",
    title: "How We Use Cookies",
    body: (
      <>
        <p>Zomee uses cookies for a limited set of purposes:</p>
        <ul>
          <li>To keep you signed in and maintain your session during a meeting.</li>
          <li>To remember your device and media preferences, such as your selected camera and microphone.</li>
          <li>To keep the Service secure and detect abuse.</li>
          <li>To understand aggregate usage so we can improve performance and reliability.</li>
        </ul>
      </>
    ),
  },
  {
    id: "types-of-cookies",
    title: "Types of Cookies We Use",
    body: (
      <ul>
        <li><strong>Strictly necessary:</strong> required for the Service to function, including authentication and security. These cannot be switched off.</li>
        <li><strong>Preference:</strong> remember your choices, such as device selection and interface settings.</li>
        <li><strong>Analytics:</strong> help us measure how the Service is used so we can improve it. These are optional.</li>
      </ul>
    ),
  },
  {
    id: "third-party",
    title: "Third-Party Cookies",
    body: (
      <p>
        Some cookies may be set by trusted third parties that provide services on our behalf, such as authentication and
        infrastructure providers. These providers may use cookies to deliver their part of the Service. We do not permit
        third parties to use cookies on Zomee for advertising.
      </p>
    ),
  },
  {
    id: "managing-cookies",
    title: "Managing Your Cookies",
    body: (
      <>
        <p>You are in control of cookies. You can:</p>
        <ul>
          <li>Adjust your browser settings to refuse or delete cookies at any time.</li>
          <li>Decline optional analytics cookies without affecting core meeting functionality.</li>
          <li>Clear locally stored preferences from your browser&apos;s privacy settings.</li>
        </ul>
        <p>
          Please note that blocking strictly necessary cookies may prevent parts of the Service, such as signing in or
          joining a meeting, from working correctly.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    title: "Updates to This Policy",
    body: (
      <p>
        We may update this Cookie Policy to reflect changes in the technologies we use or for legal and regulatory
        reasons. When we do, we will update the &quot;Last updated&quot; date at the top of this page.
      </p>
    ),
  },
];

export default function CookiePolicy() {
  return (
    <LegalLayout
      badge="Cookies"
      title="Cookie Policy"
      lead="We use only the cookies needed to run great meetings and keep them secure. Here is exactly what they do and how to control them."
      updated="July 2026"
      sections={sections}
      related={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Use" },
      ]}
    />
  );
}
