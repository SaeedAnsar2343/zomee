import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Use | Zomee",
  description: "The terms and conditions that govern your use of the Zomee video meeting service.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: (
      <p>
        By accessing or using Zomee (the &quot;Service&quot;), you agree to be bound by these Terms of Use and all
        applicable laws and regulations. If you do not agree with any part of these terms, you must not use the Service.
        These terms apply to all visitors, hosts, and participants.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    body: (
      <p>
        You must be at least 13 years old (or the minimum age of digital consent in your jurisdiction) to use Zomee. By
        using the Service, you represent and warrant that you meet this requirement and that any information you provide
        is accurate and current.
      </p>
    ),
  },
  {
    id: "description",
    title: "Description of Service",
    body: (
      <>
        <p>
          Zomee provides real-time video and audio communication tools, screen sharing, chat, reactions, and meeting
          moderation features. The Service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis.
        </p>
        <p>
          We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free, and we assume no
          responsibility for the deletion, mis-delivery, or failure to store any user communications or settings.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts & Access",
    body: (
      <>
        <p>
          Some features may require you to sign in. You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your account. You agree to:
        </p>
        <ul>
          <li>Provide accurate and complete information when creating an account.</li>
          <li>Keep your login credentials secure and not share them with others.</li>
          <li>Notify us promptly of any unauthorized use of your account.</li>
        </ul>
      </>
    ),
  },
  {
    id: "host-responsibilities",
    title: "Host Responsibilities",
    body: (
      <>
        <p>Meeting hosts have additional moderation controls and responsibilities. As a host, you agree to:</p>
        <ul>
          <li>Use moderation tools, such as muting, disabling and re-enabling chat, and removing participants, fairly and lawfully.</li>
          <li>Obtain any consent required before recording a meeting or its participants.</li>
          <li>Ensure that everyone you invite is authorized to participate.</li>
        </ul>
      </>
    ),
  },
  {
    id: "user-conduct",
    title: "User Conduct",
    body: (
      <>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Upload, post, or transmit content that is unlawful, harmful, threatening, abusive, harassing, defamatory, obscene, hateful, or otherwise objectionable.</li>
          <li>Impersonate any person or entity, including a Zomee official, host, or another participant.</li>
          <li>Harass, intimidate, or infringe upon the rights and privacy of others.</li>
          <li>Distribute malware, spam, or attempt to gain unauthorized access to any system or account.</li>
          <li>Interfere with or disrupt the Service, its servers, or networks connected to it.</li>
          <li>Record or capture meetings without the knowledge and consent of participants where required by law.</li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    body: (
      <p>
        The Service and its original content, features, branding, and functionality are and will remain the exclusive
        property of Zomee and its licensors. You retain ownership of the content you share, but grant us a limited
        license to transmit it solely for the purpose of operating the Service during your meeting.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <p>
        To the fullest extent permitted by law, Zomee disclaims all warranties, express or implied, including
        merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will
        meet your requirements or that any defects will be corrected.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    body: (
      <p>
        In no event shall Zomee, its directors, employees, or affiliates be liable for any indirect, incidental,
        special, consequential, or punitive damages arising out of or related to your use of, or inability to use, the
        Service, even if we have been advised of the possibility of such damages.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    body: (
      <p>
        We may suspend or terminate your access to the Service immediately, without prior notice, if you breach these
        Terms or engage in conduct that we determine to be harmful to other users or the platform. Upon termination,
        your right to use the Service will cease immediately.
      </p>
    ),
  },
  {
    id: "modifications",
    title: "Modifications to Service & Terms",
    body: (
      <p>
        Zomee reserves the right, at any time, to modify or discontinue the Service (or any part of it) with or without
        notice. We may also revise these Terms from time to time. Continued use of the Service after changes become
        effective constitutes acceptance of the revised Terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law",
    body: (
      <p>
        These Terms are governed by and construed in accordance with applicable law, without regard to its conflict of
        law provisions. Any disputes arising from these Terms or the Service will be subject to the exclusive
        jurisdiction of the competent courts.
      </p>
    ),
  },
];

export default function TermsOfUse() {
  return (
    <LegalLayout
      badge="Legal"
      title="Terms of Use"
      lead="These terms set out the rules for using Zomee. Please read them carefully — using the Service means you accept them."
      updated="July 2026"
      sections={sections}
      related={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/cookies", label: "Cookie Policy" },
      ]}
    />
  );
}
