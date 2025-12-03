/**
 * Privacy Policy Page
 * Displays VibesApp's comprehensive privacy policy
 * Following Web-V2 documentation guidelines and TermsPage structure
 */

import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackToTOCButton } from '@/components/document';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui-next';
import {
  handleTOCClick,
  smoothScrollTo,
  useInitialHashScroll,
  useScrollPastElement,
} from '@/utils/documentScroll';

export function PrivacyPage() {
  const navigate = useNavigate();
  const [showBackToTOC] = useScrollPastElement('[data-toc]');

  // Handle initial hash on page load
  useInitialHashScroll(80, 1000, 100);

  // Handle smooth scrolling with offset for top navigation bar
  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    sectionId: string
  ) => {
    handleTOCClick(e, sectionId, 80, 1000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            onClick={() => navigate('/settings')}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back to settings</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100">
            Privacy Policy
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-6 pb-8">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
              <strong>Effective Date:</strong> December 3, 2025
            </p>
            <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
              <strong>Last Updated:</strong> December 3, 2025
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              Introduction
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              Welcome to VibesApp. We respect your privacy and are committed to protecting your
              personal information. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your data when you use our social networking service.
            </p>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              By using VibesApp, you agree to the collection and use of information in accordance
              with this policy. If you do not agree with our policies and practices, please do not
              use our service.
            </p>
            <div className="bg-yellow-100 dim:bg-yellow-900 dark:bg-yellow-900 border-l-4 border-yellow-600 dim:border-yellow-500 dark:border-yellow-400 p-4">
              <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                Important:
              </p>
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                VibesApp is available only to users who are at least 13 years of age and reside in
                the United States. If you are under 13 or reside outside the United States, you may
                not use our service.
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <section data-toc className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              Table of Contents
            </h2>
            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 rounded-lg p-4">
              <ol className="space-y-2">
                {[
                  { title: 'Information We Collect', id: 'information-we-collect' },
                  { title: 'How We Collect Your Information', id: 'how-we-collect' },
                  { title: 'How We Use Your Information', id: 'how-we-use' },
                  { title: 'How We Store Your Information', id: 'how-we-store' },
                  { title: 'How We Share Your Information', id: 'how-we-share' },
                  { title: 'Cookies and Tracking Technologies', id: 'cookies' },
                  { title: 'Your Data Protection Rights', id: 'your-rights' },
                  { title: "Children's Privacy", id: 'childrens-privacy' },
                  { title: 'Security Measures', id: 'security' },
                  { title: 'Data Retention', id: 'data-retention' },
                  { title: 'Third-Party Services', id: 'third-party' },
                  { title: 'Changes to This Privacy Policy', id: 'changes' },
                  { title: 'Contact Us', id: 'contact' },
                ].map((item, index) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="font-semibold text-brand-600 dim:text-brand-500 dark:text-brand-400">
                      {index + 1}.
                    </span>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => handleSectionClick(e, item.id)}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 hover:text-brand-600 dim:hover:text-brand-500 dark:hover:text-brand-400 hover:underline cursor-pointer"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Section 1: Information We Collect */}
          <section id="information-we-collect" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              We collect the following types of information to provide and improve our service:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Personal Information
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Account Information: Username, birth year and month, biological sex',
                    'Profile Information: MBTI personality type, polarity preference (yin/yang), profile picture, bio',
                    'Authentication Credential: Pigeon ID (your unique password-equivalent identifier)',
                    'Location Data: GPS coordinates (latitude/longitude), city, and state based on your device location',
                    'Contact Information: Email address (for account support only)',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Content Data
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Posts: Text captions, images, location tags, timestamps',
                    'Interactions: Comments, reactions (vibes/likes), follows',
                    'Messages: Direct messages and group chat conversations',
                    'Activity: Notification preferences, app usage patterns',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Technical Information
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Device Information: Browser type, device type, operating system',
                    'Connection Data: IP address, connection timestamps',
                    'Cookies: Session cookies for authentication (pigeonId, userId) - never expire',
                    'Usage Data: Features accessed, actions taken within the app',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Automatically Collected Information
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Log Data: Server logs including IP addresses, access times, error logs',
                    'Real-time Connection Data: Server-Sent Events (SSE) connections for instant notifications and messaging',
                    'Analytics Data: Performance metrics and error tracking via OpenTelemetry (sent to PostHog)',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: How We Collect Your Information */}
          <section id="how-we-collect" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              2. How We Collect Your Information
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              We collect information in the following ways:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Information You Provide Directly
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'During Account Creation: When you sign up, you provide your username, birth year/month, sex, MBTI type, polarity, location, and profile picture',
                    'Profile Updates: When you edit your profile, bio, or change your profile picture',
                    'Content Creation: When you create posts, comments, or send messages',
                    'Settings Configuration: When you adjust notification preferences or account settings',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Information Collected Automatically
                </h3>
                <div className="bg-brand-50 dim:bg-brand-950 dark:bg-brand-950 border-l-4 border-brand-600 dim:border-brand-500 dark:border-brand-400 p-4 mb-3">
                  <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                    Location Privacy:
                  </p>
                  <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                    We collect your GPS location only during account signup and when you manually
                    update it in Settings. All other features use your cached location from your
                    profile to respect your privacy and reduce battery usage.
                  </p>
                </div>
                <ul className="ml-4 space-y-2">
                  {[
                    'Cookies: We store authentication cookies in your browser to keep you logged in',
                    'Server Logs: Our servers automatically log technical information when you use the service',
                    'Real-time Connections: We maintain persistent connections for instant messaging and notifications',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Information From Third Parties
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  <strong>Google reCAPTCHA v3:</strong> We use Google's bot protection service
                  during login and signup, which collects behavioral data to verify you're human.
                  See{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 dim:text-brand-500 dark:text-brand-400 hover:underline"
                  >
                    Google's Privacy Policy
                  </a>{' '}
                  for details on how Google processes this data.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How We Use Your Information */}
          <section id="how-we-use" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              We use your information for the following purposes:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Service Delivery
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Authentication: To verify your identity and maintain your session across visits',
                    'Content Display: To show you posts from nearby users based on your location',
                    'Messaging: To enable direct messaging and group chats with other users',
                    'Notifications: To send you real-time activity updates (new followers, comments, reactions, messages)',
                    'Profile Display: To show your public profile to other users',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Service Improvement
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Performance Monitoring: To identify and fix technical issues using analytics data',
                    'Feature Development: To understand how users interact with features and improve them',
                    'Security: To detect and prevent spam, abuse, fraud, and other harmful activities',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Community Safety
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Moderation: To enforce our community guidelines and terms of service',
                    'Strike System: To track violations and apply graduated consequences (temporary restrictions or permanent bans)',
                    'Reporting: To investigate reported content and take appropriate action',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 border-l-4 border-vibe-negative p-4">
              <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                We will never:
              </p>
              <ul className="space-y-2">
                {[
                  'Sell your personal information to third parties',
                  'Share your data with advertisers or marketing companies',
                  'Send you marketing emails or promotional messages',
                ].map((item) => (
                  <li
                    key={item}
                    className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                  >
                    <span className="text-vibe-negative font-bold">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 4: How We Store Your Information */}
          <section id="how-we-store" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              4. How We Store Your Information
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Storage Location and Security
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Database: Your data is stored securely in MongoDB Atlas cloud databases located in the United States',
                    'File Storage: Images and media files are stored in AWS S3 with CloudFront CDN for fast global delivery',
                    'Hosting: Our application servers are hosted on Heroku infrastructure in the United States',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Security Measures
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Encryption in Transit: All data transmitted between your device and our servers is encrypted using HTTPS/TLS',
                    'Authentication: Your Pigeon ID (password) is never exposed in API responses and is excluded from database queries by default',
                    'Access Controls: Database access is restricted to authorized personnel only',
                    'Monitoring: We use OpenTelemetry for system monitoring to detect and respond to security incidents',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-yellow-100 dim:bg-yellow-900 dark:bg-yellow-900 border-l-4 border-yellow-600 dim:border-yellow-500 dark:border-yellow-400 p-4">
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                <strong>Note:</strong> While we implement industry-standard security measures, no
                method of transmission over the internet or electronic storage is 100% secure. We
                cannot guarantee absolute security of your information.
              </p>
            </div>
          </section>

          {/* Section 5: How We Share Your Information */}
          <section id="how-we-share" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              5. How We Share Your Information
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              We take your privacy seriously and do not sell or rent your personal information to
              third parties. We only share your information in the following limited circumstances:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  With Other Users (Public Information)
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
                  The following information is visible to other VibesApp users:
                </p>
                <ul className="ml-4 space-y-2">
                  {[
                    'Your username, profile picture, bio',
                    'Your age (calculated from birth year/month)',
                    'Your MBTI personality type and polarity',
                    'Your approximate distance from other users (not precise coordinates)',
                    'Your posts, comments, and reactions',
                    'Your follower/following counts',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mt-2">
                  <strong>Note:</strong> Your exact GPS coordinates, Pigeon ID, email address, and
                  direct messages are never made public.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  With Service Providers
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
                  We share limited data with third-party service providers who help us operate
                  VibesApp:
                </p>
                <ul className="ml-4 space-y-2">
                  {[
                    'AWS (Amazon Web Services): Stores your images and media files',
                    'MongoDB Atlas: Hosts our database containing your account information',
                    'Heroku: Provides hosting infrastructure for our application servers',
                    'PostHog: Receives anonymized analytics and error tracking data',
                    "Google reCAPTCHA: Receives behavioral data during login/signup to verify you're not a bot",
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  For Legal Reasons
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
                  We may disclose your information if required to do so by law:
                </p>
                <ul className="ml-4 space-y-2">
                  {[
                    'Legal Process: When we receive a subpoena, court order, or other valid legal request',
                    'Safety and Protection: To protect against harm to the rights, property, or safety of VibesApp, our users, or the public',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-brand-50 dim:bg-brand-950 dark:bg-brand-950 border-l-4 border-brand-600 dim:border-brand-500 dark:border-brand-400 p-4 mt-3">
                  <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                    <strong>We will notify you</strong> when we disclose your information to law
                    enforcement or government authorities, unless we are legally prohibited from
                    doing so.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Business Transfers
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  If VibesApp is involved in a merger, acquisition, or sale of assets, your
                  information may be transferred. <strong>We will notify you</strong> via email
                  and/or prominent notice of any change in ownership.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Cookies and Tracking Technologies */}
          <section id="cookies" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              6. Cookies and Tracking Technologies
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  What Cookies We Use
                </h3>
                <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                    Authentication Cookies (Essential):
                  </p>
                  <ul className="space-y-2">
                    {[
                      'pigeonId - Your authentication credential (never exposed in API responses)',
                      'userId - Your unique user identifier',
                      'Expiration: 10 years (effectively permanent - cookies will not expire to ensure continued access)',
                      'Purpose: Keep you logged in and authenticate API requests',
                    ].map((item) => (
                      <li
                        key={item}
                        className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                      >
                        <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 mt-3">
                    These cookies are essential for the service to function. Without them, you
                    cannot use VibesApp.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Third-Party Cookies
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  <strong>Google reCAPTCHA v3:</strong> Google may set cookies during login/signup
                  for bot detection. See{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 dim:text-brand-500 dark:text-brand-400 hover:underline"
                  >
                    Google's Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 dim:text-brand-500 dark:text-brand-400 hover:underline"
                  >
                    Terms of Service
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Managing Cookies
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  You can control cookies through your browser settings. However, disabling cookies
                  will prevent you from logging in and using VibesApp. Clearing cookies will log you
                  out of your session.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Your Data Protection Rights */}
          <section id="your-rights" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              7. Your Data Protection Rights
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              You have the following rights regarding your personal information:
            </p>

            <div className="ml-4 space-y-3">
              {[
                {
                  title: 'Right to Access',
                  description:
                    'You have the right to request copies of your personal data. See the Contact Us section below for how to submit a request.',
                },
                {
                  title: 'Right to Rectification',
                  description:
                    'You can edit most information directly in your Settings page (username, bio, profile picture, location, MBTI type, notification preferences). For other corrections, see the Contact Us section below.',
                },
                {
                  title: 'Right to Erasure ("Right to be Forgotten")',
                  description:
                    'You may request deletion of your personal data. See the Contact Us section below to request account deletion. Your personal information will be permanently deleted, and your posts will be anonymized with username changed to "deleted-xxx".',
                },
                {
                  title: 'Right to Data Portability',
                  description:
                    'You have the right to request transfer of your data to another service. See the Contact Us section below to request a data export in JSON or CSV format.',
                },
                {
                  title: 'Right to Withdraw Consent',
                  description:
                    'You can withdraw consent at any time by adjusting notification preferences in Settings or via the Contact Us section below.',
                },
              ].map((right) => (
                <div key={right.title}>
                  <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                    {right.title}
                  </h3>
                  <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                    {right.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 border-l-4 border-brand-600 dim:border-brand-500 dark:border-brand-400 p-4">
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                <strong>Response Time:</strong> We have one month to respond to your data protection
                requests. For complex requests, we may extend this by two additional months with
                explanation.
              </p>
            </div>
          </section>

          {/* Section 8: Children's Privacy */}
          <section id="childrens-privacy" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              8. Children's Privacy
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              VibesApp is intended for users aged 13 and older in compliance with the Children's
              Online Privacy Protection Act (COPPA).
            </p>

            <div className="bg-brand-50 dim:bg-brand-950 dark:bg-brand-950 border-l-4 border-brand-600 dim:border-brand-500 dark:border-brand-400 p-4">
              <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                Age Requirement:
              </p>
              <ul className="space-y-2">
                {[
                  'Minimum Age: You must be at least 13 years old to create an account',
                  'Age Verification: We collect birth year and month during signup to verify age eligibility',
                  'Enforcement: We rely on users to provide accurate age information during registration',
                ].map((item) => (
                  <li
                    key={item}
                    className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                  >
                    <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              We do not knowingly collect personal information from children under 13. If we
              discover that a user under 13 has provided personal information, we will delete the
              account and all associated data immediately.
            </p>

            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              If you believe a user is under 13 years of age, please{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('contact');
                  if (element) {
                    const offset = 80;
                    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - offset;
                    smoothScrollTo(offsetPosition, 1000);
                  }
                }}
                className="text-brand-600 dim:text-brand-500 dark:text-brand-400 hover:underline inline"
              >
                contact us
              </button>{' '}
              immediately.
            </p>
          </section>

          {/* Section 9: Security Measures */}
          <section id="security" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              9. Security Measures
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect
              your personal information:
            </p>

            <div className="ml-4 space-y-2">
              <ul className="space-y-2">
                {[
                  'HTTPS/TLS Encryption: All data transmitted between your device and our servers is encrypted',
                  'Secure Authentication: Your Pigeon ID is never included in API responses',
                  'Session Management: Secure cookie-based sessions that never expire',
                  'Bot Protection: Google reCAPTCHA v3 prevents automated attacks',
                  'Monitoring: Real-time security monitoring and error tracking',
                  'Regular Backups: Automated database backups to prevent data loss',
                ].map((item) => (
                  <li
                    key={item}
                    className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                  >
                    <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-100 dim:bg-yellow-900 dark:bg-yellow-900 border-l-4 border-yellow-600 dim:border-yellow-500 dark:border-yellow-400 p-4">
              <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                Your Responsibility:
              </p>
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                Keep your Pigeon ID confidential and never share it with anyone. Log out on shared
                devices and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('contact');
                    if (element) {
                      const offset = 80;
                      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                      const offsetPosition = elementPosition - offset;
                      smoothScrollTo(offsetPosition, 1000);
                    }
                  }}
                  className="text-brand-600 dim:text-brand-500 dark:text-brand-400 hover:underline inline"
                >
                  report suspicious activity
                </button>{' '}
                immediately.
              </p>
            </div>
          </section>

          {/* Section 10: Data Retention */}
          <section id="data-retention" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              10. Data Retention
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Active Accounts
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'Account Data: Retained while your account is active',
                    'Content: Posts, comments, and messages are retained indefinitely',
                    'Activity Logs: Server logs retained for 90 days',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Deleted Accounts
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
                  When you delete your account:
                </p>
                <ul className="ml-4 space-y-2">
                  {[
                    'Personal Information: Permanently deleted within 30 days',
                    'Content Anonymization: Posts remain visible but attributed to "deleted-xxx"',
                    'Messages: Direct messages remain visible but anonymized',
                    'Soft-Deleted Posts: Retained for 90 days before permanent deletion',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  Inactive Accounts
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  We do not currently have an automatic deletion policy for inactive accounts. We
                  may implement automatic deletion of accounts inactive for extended periods (e.g.,
                  2+ years) with advance notice to users.
                </p>
              </div>
            </div>
          </section>

          {/* Section 11: Third-Party Services */}
          <section id="third-party" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              11. Third-Party Services
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
              We use the following third-party services to operate VibesApp:
            </p>

            <div className="ml-4 space-y-2">
              <ul className="space-y-2">
                {[
                  'AWS (Amazon Web Services): Image and media storage (S3), content delivery (CloudFront CDN)',
                  'MongoDB Atlas: Database hosting for all application data',
                  'Heroku (Salesforce): Application server hosting',
                  'Google reCAPTCHA v3: Bot detection and prevention',
                  'PostHog: Performance monitoring, error tracking, and analytics',
                ].map((item) => (
                  <li
                    key={item}
                    className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                  >
                    <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              Each service has its own privacy policy. All service providers are contractually
              obligated to protect your data and may only use it for providing services to us.
            </p>

            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 border-l-4 border-vibe-negative p-4">
              <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                We will never:
              </p>
              <ul className="space-y-2">
                {[
                  'Share your data with advertising networks',
                  'Sell your data to data brokers or marketing companies',
                  'Add third-party services that compromise your privacy without transparency',
                ].map((item) => (
                  <li
                    key={item}
                    className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                  >
                    <span className="text-vibe-negative font-bold">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 12: Changes to This Privacy Policy */}
          <section id="changes" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              12. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, technology, or legal requirements.
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  How We Notify You of Changes
                </h3>
                <ul className="ml-4 space-y-2">
                  {[
                    'The "Last Updated" date at the top will be updated',
                    'Material changes will trigger email notification (if provided)',
                    'Prominent notice on our website/app for significant changes',
                    'In-app notification when you next log in',
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3"
                    >
                      <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              By continuing to use VibesApp after changes become effective, you accept the updated
              Privacy Policy. If you do not agree with the changes, you should stop using the
              service and may request account deletion.
            </p>
          </section>

          {/* Section 13: Contact Us */}
          <section id="contact" className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              13. Contact Us
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-3">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us:
            </p>

            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                VibesApp
              </p>
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 mb-1">
                Email: support@vibesapp.net
              </p>
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                Business Address: [Coming soon]
              </p>
            </div>

            <div className="bg-brand-50 dim:bg-brand-950 dark:bg-brand-950 border-l-4 border-brand-600 dim:border-brand-500 dark:border-brand-400 p-4">
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                <strong>Response Time:</strong> We aim to respond to all inquiries within 5 business
                days. For data protection requests, we will respond within 30 days as required by
                applicable law.
              </p>
            </div>

            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              For data protection requests (access, deletion, portability, etc.), please email us
              with "Data Protection Request" in the subject line and include your username and the
              nature of your request.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 dim:border-gray-600 dark:border-gray-700 pt-6 mt-8">
            <p className="text-center text-gray-700 dim:text-gray-300 dark:text-gray-300 font-medium">
              This Privacy Policy is part of our commitment to transparency. We believe in clear,
              honest communication about how we handle your data. Your trust is important to us.
            </p>
            <p className="text-center text-gray-700 dim:text-gray-300 dark:text-gray-300 mt-4">
              Thank you for using VibesApp.
            </p>
          </div>
        </div>

        {/* Back to Table of Contents Button */}
        <BackToTOCButton show={showBackToTOC} />
      </div>
    </AppLayout>
  );
}
