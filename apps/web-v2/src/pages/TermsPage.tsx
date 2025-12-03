import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';

export function TermsPage() {
  const navigate = useNavigate();

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
            Terms of Service
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-6 pb-8">
          <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
            <strong>Last Updated:</strong> 3 December 2025
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              Welcome to VibesApp! These Terms of Service ("Terms") constitute a legally binding
              agreement between you and VibesApp ("we," "us," or "our") governing your access to and
              use of the VibesApp mobile application and related services (collectively, the
              "Service").
            </p>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              By creating an account, accessing, or using VibesApp, you agree to be bound by these
              Terms. If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              2. Eligibility and Age Requirements
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              You must be at least 13 years old to use VibesApp. By using the Service, you represent
              and warrant that you are at least 13 years of age.
            </p>
            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 border-l-4 border-brand-600 dim:border-brand-500 dark:border-brand-400 p-4">
              <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold mb-2">
                Important Notice:
              </p>
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                Our community includes users as young as 13 years old. All users must communicate
                and behave appropriately. Do not say or share anything you wouldn't say to a
                13-year-old.
              </p>
            </div>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              If you are under 18, you should review these Terms with a parent or guardian to ensure
              you understand them.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              3. Account Registration and Security
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  3.1 Account Creation
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  To use VibesApp, you must create an account by providing accurate and complete
                  information, including your biological sex and age. You agree to provide truthful
                  information during registration and to keep your account information current.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  3.2 Biological Self-Identification Requirement
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  <strong>
                    You must accurately identify your biological sex and age when creating your
                    account.
                  </strong>{' '}
                  Lying about or misrepresenting your biological sex or age is strictly prohibited
                  and may result in immediate account termination without notice. This requirement
                  exists to maintain the safety and transparency of our community.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  3.3 One Account Per User Policy
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  <strong>You are permitted to have only ONE account on VibesApp.</strong> Creating,
                  maintaining, or using multiple accounts is prohibited and may result in closure of
                  all your accounts, which will lead to permanent data loss. We do not provide data
                  recovery for accounts closed due to policy violations.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  3.4 Account Security
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account
                  credentials and for all activities that occur under your account. Notify us
                  immediately of any unauthorised use of your account.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              4. Description of Service
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              VibesApp is a mobile application designed for self-growth and local community building
              amongst professionals. The Service includes:
            </p>
            <ul className="ml-4 space-y-2">
              {[
                'User profiles',
                'Event creation and discovery',
                'Direct messaging between users',
                'Goal tracking features',
                'Hashtag-based content organisation and discovery',
                'Location-based features to connect with local communities',
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
            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 border-l-4 border-brand-600 dim:border-brand-500 dark:border-brand-400 p-4">
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                <strong>VibesApp is a raw, authentic platform.</strong> We do not use AI or
                automated features to filter, curate, or modify user interactions. Our ethos is to
                keep the platform genuine and human-centred.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              5. Acceptable Use Policy
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  5.1 Prohibited Conduct
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
                  You agree NOT to:
                </p>
                <ul className="ml-4 space-y-2">
                  {[
                    'Harass, bully, threaten, intimidate, or abuse other users',
                    'Engage in inappropriate behaviour, including sexual harassment or unwanted romantic advances',
                    'Post or share content that is obscene, pornographic, violent, hateful, discriminatory, or illegal',
                    'Impersonate another person or entity',
                    'Share content that would be inappropriate for a 13-year-old to see or hear',
                    'Spam, solicit, or engage in unauthorised commercial activities',
                    'Violate any applicable laws or regulations',
                    'Attempt to hack, disrupt, or compromise the security of the Service',
                    "Share another user's personal information without consent",
                    'Use the Service for any fraudulent or malicious purpose',
                    'Create multiple accounts',
                    'Provide false information about your biological sex or age',
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
                  5.2 Content Standards
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  Given that our community includes users as young as 13, all communications must be
                  age-appropriate and respectful. Consider whether you would say something to a
                  teenager before posting.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              6. Events and In-Person Meetups
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  6.1 User-Organised Events
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  VibesApp enables users to organise and attend local events and meetups.{' '}
                  <strong>VibesApp is a platform only</strong> – we do not organise, sponsor,
                  supervise, or control these events.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  6.2 Event Liability Disclaimer
                </h3>
                <div className="bg-yellow-100 dim:bg-yellow-900 dark:bg-yellow-900 border-l-4 border-yellow-600 dim:border-yellow-500 dark:border-yellow-400 p-4 space-y-2">
                  <p className="text-gray-900 dim:text-yellow-100 dark:text-yellow-100 font-semibold">
                    IMPORTANT: By using VibesApp to organise or attend events, you acknowledge and
                    agree that:
                  </p>
                  <ul className="ml-4 space-y-2">
                    {[
                      'VibesApp is not liable for any injuries, harm, damages, or losses that occur at events organised through the platform',
                      'VibesApp is not liable for event cancellations, no-shows, or changes to event details',
                      'VibesApp is not liable for any financial losses resulting from events, including travel expenses, tickets, or other costs',
                      'You participate in events entirely at your own risk',
                      'You are responsible for your own safety and the safety of events you organise',
                      'You should use reasonable caution when meeting people from the internet',
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

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  6.3 Event Organiser Responsibilities
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
                  If you organise an event, you are solely responsible for:
                </p>
                <ul className="ml-4 space-y-2">
                  {[
                    'The safety and well-being of attendees',
                    'Compliance with all applicable laws and regulations',
                    'Obtaining necessary permits, insurance, or licences',
                    'Communicating accurate event information',
                    'Any liabilities arising from the event',
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

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              7. Messaging and Communication
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              VibesApp provides direct messaging features to facilitate communication between users.
              You are solely responsible for your communications. Do not share personal information
              (such as home addresses, financial information, or other sensitive data) unless you
              are comfortable doing so.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              8. Location Data and Privacy
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              VibesApp collects and uses location data to provide local community features and event
              discovery. We also collect profile information and usage analytics to improve the
              Service.
            </p>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              Your use of VibesApp is also governed by our Privacy Policy, which explains how we
              collect, use, and protect your personal information. By using VibesApp, you consent to
              our data practices as described in the Privacy Policy.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              9. Third-Party Services
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
              VibesApp uses the following third-party services:
            </p>
            <ul className="ml-4 space-y-2">
              <li className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3">
                <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                  •
                </span>
                <span>
                  <strong>Amazon Web Services</strong> for hosting and infrastructure
                </span>
              </li>
              <li className="text-gray-700 dim:text-gray-300 dark:text-gray-300 flex gap-3">
                <span className="text-brand-600 dim:text-brand-500 dark:text-brand-400 font-bold">
                  •
                </span>
                <span>
                  <strong>Google reCAPTCHA</strong> for security and spam prevention
                </span>
              </li>
            </ul>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              These services have their own terms and privacy policies. We do not provide
              third-party integrations that share your data with external applications.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              10. Payments and Subscriptions
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  10.1 Pay-As-You-Go Model
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  VibesApp offers premium features on a pay-as-you-go basis. You pay only for the
                  features you use. Pricing for premium features will be clearly displayed within
                  the app.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  10.2 Payment Processing
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  All payments are processed securely through third-party payment processors. You
                  agree to provide accurate payment information and authorise us to charge your
                  selected payment method.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  10.3 Refunds
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  All payments are final and non-refundable except as required by law or as
                  otherwise specified in writing.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  10.4 Payment Disputes
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  If you believe you were charged in error, contact us within 30 days of the charge.
                </p>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              11. Intellectual Property
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  11.1 VibesApp Ownership
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  VibesApp and its content, features, and functionality (including but not limited
                  to software, text, graphics, logos, and design) are owned by VibesApp and are
                  protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  11.2 User Content
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  You retain ownership of content you create or share through VibesApp (including
                  profile information, messages, goals, and event details). By using the Service,
                  you grant VibesApp a non-exclusive, worldwide, royalty-free licence to use,
                  display, and distribute your content as necessary to provide and improve the
                  Service.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  11.3 Licence to Use VibesApp
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  Subject to your compliance with these Terms, we grant you a limited,
                  non-exclusive, non-transferable, revocable licence to use VibesApp for personal,
                  non-commercial purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              12. Account Termination
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  12.1 Termination by You
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  You may delete your account at any time through the app settings. Upon deletion,
                  your account and associated data will be permanently removed according to our
                  Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  12.2 Termination by VibesApp
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
                  We reserve the right to suspend or terminate your account at any time, with or
                  without notice, for any reason, including but not limited to:
                </p>
                <ul className="ml-4 space-y-2">
                  {[
                    'Violation of these Terms',
                    'Providing false information about your biological sex or age',
                    'Creating or maintaining multiple accounts',
                    'Engaging in prohibited conduct',
                    'Fraudulent or illegal activity',
                    'Risk to the safety of other users',
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
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  <strong>
                    Accounts terminated for policy violations (including false identification or
                    multiple accounts) will be closed immediately without notice and without the
                    opportunity to retrieve data.
                  </strong>
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  12.3 Effect of Termination
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  Upon termination, your right to use VibesApp immediately ceases. We may retain
                  certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              13. Disclaimers and Warranties
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  13.1 "As Is" Service
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed uppercase text-sm font-semibold">
                  Vibesapp is provided on an "as is" and "as available" basis without warranties of
                  any kind, either express or implied, including but not limited to warranties of
                  merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  13.2 No Warranty of Availability
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  We do not guarantee that VibesApp will be available at all times or that it will
                  be error-free. We may modify, suspend, or discontinue the Service at any time.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  13.3 User Interactions
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  We do not screen or vet users. You are solely responsible for your interactions
                  with other users. We do not guarantee the accuracy of user profiles or
                  representations.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  13.4 Event Disclaimer
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  We make no representations or warranties regarding events organised through
                  VibesApp. You attend events at your own risk.
                </p>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              14. Limitation of Liability
            </h2>
            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 p-4 space-y-3">
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed uppercase text-sm font-semibold">
                To the maximum extent permitted by law, vibesapp and its officers, directors,
                employees, and agents shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of profits, revenue, data, or use,
                arising out of or related to your use of vibesapp, whether based on warranty,
                contract, tort (including negligence), or any other legal theory, even if we have
                been advised of the possibility of such damages.
              </p>
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed uppercase text-sm font-semibold">
                In no event shall vibesapp's total liability to you exceed the amount you paid to
                vibesapp in the twelve (12) months preceding the event giving rise to liability, or
                one hundred dollars ($100), whichever is greater.
              </p>
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed text-sm">
                Some jurisdictions do not allow the exclusion or limitation of certain damages, so
                some of the above limitations may not apply to you.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              15. Indemnification
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-2">
              You agree to indemnify, defend, and hold harmless VibesApp and its officers,
              directors, employees, agents, and affiliates from and against any claims, liabilities,
              damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out
              of or related to:
            </p>
            <ul className="ml-4 space-y-2">
              {[
                'Your use of VibesApp',
                'Your violation of these Terms',
                'Your violation of any rights of another person or entity',
                'Events you organise or attend through VibesApp',
                'Content you post or share through the Service',
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
          </section>

          {/* Section 16 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              16. Dispute Resolution and Governing Law
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  16.1 Governing Law
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  These Terms are governed by and construed in accordance with the laws of the
                  United States and the state in which VibesApp is incorporated, without regard to
                  conflict of law principles.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  16.2 Informal Resolution
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  If you have a dispute with VibesApp, please contact us first at
                  support@vibesapp.net to attempt to resolve the matter informally.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  16.3 Arbitration Agreement
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  Any dispute arising out of or relating to these Terms or the Service that cannot
                  be resolved informally shall be resolved through binding arbitration in accordance
                  with the rules of the American Arbitration Association. Arbitration will take
                  place on an individual basis; class arbitrations and class actions are not
                  permitted.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  16.4 Exception for Small Claims
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  You may bring a claim in small claims court if it qualifies and remains in small
                  claims court.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  16.5 Waiver of Jury Trial
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed uppercase text-sm font-semibold">
                  You and vibesapp waive any right to a jury trial.
                </p>
              </div>
            </div>
          </section>

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              17. Changes to Terms
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              We may update these Terms from time to time. If we make material changes, we will
              notify you by email (if you have provided one) or through a prominent notice within
              the app. Your continued use of VibesApp after changes become effective constitutes
              acceptance of the updated Terms.
            </p>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
              The "Last Updated" date at the top of these Terms indicates when they were last
              revised.
            </p>
          </section>

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              18. General Provisions
            </h2>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  18.1 Entire Agreement
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement
                  between you and VibesApp regarding the Service.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  18.2 Severability
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  If any provision of these Terms is found to be unenforceable, the remaining
                  provisions will remain in full effect.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  18.3 Waiver
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  Our failure to enforce any provision of these Terms does not constitute a waiver
                  of that provision.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  18.4 Assignment
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  You may not assign or transfer these Terms or your account without our written
                  consent. We may assign these Terms without restriction.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                  18.5 Force Majeure
                </h3>
                <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed">
                  We shall not be liable for any failure or delay in performance due to
                  circumstances beyond our reasonable control.
                </p>
              </div>
            </div>
          </section>

          {/* Section 19 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              19. Contact Information
            </h2>
            <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300 leading-relaxed mb-3">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-100 dim:bg-gray-800 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-gray-900 dim:text-gray-100 dark:text-gray-100 font-semibold">
                VibesApp
              </p>
              <p className="text-gray-700 dim:text-gray-300 dark:text-gray-300">
                Email:{' '}
                <a
                  href="mailto:support@vibesapp.net"
                  className="text-brand-600 dim:text-brand-500 dark:text-brand-400 hover:underline"
                >
                  support@vibesapp.net
                </a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 dim:border-gray-600 dark:border-gray-700 pt-6 mt-8">
            <p className="text-center text-gray-700 dim:text-gray-300 dark:text-gray-300 font-medium">
              By using VibesApp, you acknowledge that you have read, understood, and agree to be
              bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
