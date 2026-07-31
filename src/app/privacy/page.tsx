import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Zomee",
  description: "How Zomee collects, uses, and protects your data during real-time video meetings.",
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    body: (
      <>
        <p>
          Welcome to Zomee. We respect your privacy and are committed to protecting your personal data. This Privacy
          Policy explains how we collect, use, store, and safeguard your information when you visit our website and use
          our video conferencing services (the &quot;Service&quot;).
        </p>
        <p>
          By using Zomee, you agree to the collection and use of information in accordance with this policy. If you do
          not agree with our practices, please do not use the Service.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data We Collect",
    body: (
      <>
        <p>When you use Zomee, we may collect the following categories of information:</p>
        <ul>
          <li><strong>Identity data:</strong> the display name you provide when joining or creating a meeting.</li>
          <li><strong>Account data:</strong> if you sign in, your name, email address, and profile photo from your authentication provider.</li>
          <li><strong>Technical data:</strong> IP address, browser type and version, device type, operating system, and time zone.</li>
          <li><strong>Usage data:</strong> meeting duration, features used (camera, microphone, chat, screen share, reactions), and connection quality metrics.</li>
          <li><strong>Communications data:</strong> chat messages are relayed between participants in real time; we do not persist them after a meeting ends.</li>
        </ul>
        <p>
          We do <strong>not</strong> record your video or audio unless a recording is explicitly initiated by a
          participant on their own device.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-data",
    title: "How We Use Your Data",
    body: (
      <>
        <p>We use your personal data only where we have a lawful basis to do so, including:</p>
        <ul>
          <li>To provide, operate, and maintain the Service, including establishing peer-to-peer and server-relayed media connections.</li>
          <li>To authenticate you and secure access to meetings you are authorized to join.</li>
          <li>To monitor and improve platform stability, performance, and quality.</li>
          <li>To detect, prevent, and address technical issues, abuse, or security incidents.</li>
          <li>To notify you about material changes to the Service or this policy.</li>
        </ul>
      </>
    ),
  },
  {
    id: "legal-basis",
    title: "Legal Basis for Processing",
    body: (
      <>
        <p>
          For users in the European Economic Area and the United Kingdom, we process personal data under the following
          legal bases:
        </p>
        <ul>
          <li><strong>Performance of a contract:</strong> to deliver the meeting service you request.</li>
          <li><strong>Legitimate interests:</strong> to keep the platform secure, reliable, and abuse-free.</li>
          <li><strong>Consent:</strong> where required, for example for optional cookies and analytics.</li>
          <li><strong>Legal obligation:</strong> where we must retain or disclose data to comply with applicable law.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "Sharing & Disclosure",
    body: (
      <>
        <p>We do not sell your personal data. We may share limited data with:</p>
        <ul>
          <li><strong>Infrastructure providers:</strong> media servers and hosting partners that transmit meeting traffic on our behalf.</li>
          <li><strong>Other participants:</strong> your display name and real-time media are visible to others in the same meeting.</li>
          <li><strong>Legal authorities:</strong> when required by law, subpoena, or to protect the rights and safety of our users.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    body: (
      <>
        <p>
          All video, audio, and chat streams are encrypted in transit using industry-standard protocols (DTLS-SRTP for
          media and TLS for signaling). We apply appropriate technical and organizational measures to protect your data
          against accidental loss, unauthorized access, alteration, or disclosure.
        </p>
        <p>
          No method of transmission over the internet is completely secure, so while we strive to protect your data, we
          cannot guarantee absolute security.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    body: (
      <p>
        We keep personal data only for as long as necessary to fulfill the purposes described in this policy. Real-time
        meeting content, such as chat messages and media streams, is not stored once a meeting ends. Account and
        technical data is retained for the life of your account or as required by law.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: (
      <>
        <p>Depending on where you live, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request deletion of your personal data.</li>
          <li>Object to or restrict certain processing activities.</li>
          <li>Request a portable copy of your data.</li>
          <li>Withdraw consent at any time where processing is based on consent.</li>
        </ul>
        <p>To exercise any of these rights, contact us using the details at the bottom of this page.</p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    body: (
      <p>
        Zomee is not directed to children under the age of 13 (or the minimum age required in your jurisdiction). We do
        not knowingly collect personal data from children. If you believe a child has provided us with personal data,
        please contact us so we can remove it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. When we make material changes, we will revise the
        &quot;Last updated&quot; date above and, where appropriate, notify you within the Service. We encourage you to
        review this page periodically.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      badge="Privacy"
      title="Privacy Policy"
      lead="Your conversations belong to you. This policy explains exactly what we collect, why we collect it, and the controls you have over your data."
      updated="July 2026"
      sections={sections}
      related={[
        { href: "/terms", label: "Terms of Use" },
        { href: "/cookies", label: "Cookie Policy" },
      ]}
    />
  );
}
