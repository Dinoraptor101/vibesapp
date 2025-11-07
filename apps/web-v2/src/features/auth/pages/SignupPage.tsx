/**
 * Signup Page
 * User-facing signup flow with multi-step wizard
 */

import { SignupWizard } from '../components/SignupWizard';

export function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <SignupWizard />
    </div>
  );
}
