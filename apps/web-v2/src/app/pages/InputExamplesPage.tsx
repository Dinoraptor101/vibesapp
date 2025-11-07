/**
 * Input Component Examples Page
 *
 * Comprehensive showcase of Input, Textarea, and Label components
 * with all variants, states, and features.
 */

import { Button } from '@/components/ui-next/Button';
import { Input } from '@/components/ui-next/Input';
import { Label } from '@/components/ui-next/Label';
import { Textarea } from '@/components/ui-next/Textarea';
import { useState } from 'react';

export function InputExamplesPage() {
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  // Simulate username validation
  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('');
      setUsernameSuccess('');
      return;
    }

    setIsValidating(true);

    setTimeout(() => {
      if (value.length < 3) {
        setUsernameError('Username must be at least 3 characters');
        setUsernameSuccess('');
      } else if (value === 'admin' || value === 'test') {
        setUsernameError('This username is already taken');
        setUsernameSuccess('');
      } else {
        setUsernameError('');
        setUsernameSuccess('Username is available!');
      }
      setIsValidating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-light-bg-base dark:bg-dark-bg-base p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Input Components
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
            Input, Textarea, and Label with all states and features
          </p>
        </div>

        {/* Basic Inputs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Basic Input
          </h2>
          <div className="space-y-6">
            <Input placeholder="Enter text..." />
            <Input label="Email Address" placeholder="you@example.com" type="email" />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              type="tel"
              helperText="Include country code"
            />
          </div>
        </section>

        {/* Validation States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Validation States
          </h2>
          <div className="space-y-6">
            <Input
              label="Email"
              placeholder="you@example.com"
              error="Please enter a valid email address"
            />
            <Input label="Username" value="johndoe" success="Username is available!" />
            <Input
              label="Username Validation"
              placeholder="Try 'admin' or 'test'"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                validateUsername(e.target.value);
              }}
              error={usernameError}
              success={usernameSuccess}
              helperText={isValidating ? 'Checking availability...' : 'Enter a unique username'}
            />
          </div>
        </section>

        {/* Password Input */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Password Input with Toggle
          </h2>
          <div className="space-y-6">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              showPasswordToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Click the eye icon to show/hide password"
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              showPasswordToggle
              error={
                password && password.length < 8
                  ? 'Password must be at least 8 characters'
                  : undefined
              }
            />
          </div>
        </section>

        {/* Required Fields */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Required Fields
          </h2>
          <div className="space-y-6">
            <Input label="Full Name" placeholder="John Doe" required />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              error={!email && 'Email is required'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </section>

        {/* Disabled State */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Disabled State
          </h2>
          <div className="space-y-6">
            <Input
              label="Disabled Input"
              placeholder="Cannot edit"
              disabled
              value="This field is disabled"
            />
            <Input label="Read-only Email" type="email" value="user@example.com" disabled />
          </div>
        </section>

        {/* Textarea Basic */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Textarea
          </h2>
          <div className="space-y-6">
            <Textarea placeholder="Write something..." rows={3} />
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself"
              helperText="A brief description of who you are"
              rows={4}
            />
            <Textarea label="Message" placeholder="Your message here..." required />
          </div>
        </section>

        {/* Textarea with Character Counter */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Character Counter
          </h2>
          <div className="space-y-6">
            <Textarea
              label="Bio (200 characters max)"
              placeholder="Tell us about yourself"
              maxLength={200}
              showCharCount
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              helperText="Counter appears at 90% of limit"
              rows={4}
            />
            <Textarea
              label="Short Description (50 chars)"
              placeholder="Type here to see counter appear..."
              maxLength={50}
              showCharCount
              charCountThreshold={0.7}
              helperText="Counter appears at 70% (customized threshold)"
              rows={3}
            />
          </div>
        </section>

        {/* Textarea Auto-Resize */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Auto-Resize Textarea
          </h2>
          <div className="space-y-6">
            <Textarea
              label="Auto-expanding Message"
              placeholder="Type to see it grow..."
              autoResize
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              helperText="This textarea automatically expands as you type"
              rows={2}
            />
          </div>
        </section>

        {/* Textarea Validation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Textarea Validation
          </h2>
          <div className="space-y-6">
            <Textarea
              label="Error State"
              placeholder="This field has an error"
              error="Description must be at least 10 characters"
              rows={3}
            />
            <Textarea
              label="Success State"
              placeholder="This field is valid"
              success="Looks good!"
              value="This is a valid description that meets all requirements."
              rows={3}
            />
            <Textarea
              label="Disabled Textarea"
              value="This textarea is disabled and cannot be edited"
              disabled
              rows={3}
            />
          </div>
        </section>

        {/* Standalone Labels */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Standalone Labels
          </h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="standalone-input">Standard Label</Label>
              <input
                id="standalone-input"
                type="text"
                placeholder="Input with standalone label"
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-base dark:bg-dark-bg-base text-light-text-primary dark:text-dark-text-primary mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="required-input" required>
                Required Label
              </Label>
              <input
                id="required-input"
                type="text"
                placeholder="This field is required"
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-base dark:bg-dark-bg-base text-light-text-primary dark:text-dark-text-primary mt-1.5"
              />
            </div>
          </div>
        </section>

        {/* Real World Example - Form */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
            Real World Example - Contact Form
          </h2>
          <div className="p-6 bg-light-bg-elevated dark:bg-dark-bg-elevated rounded-lg space-y-6">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              Get in Touch
            </h3>

            <Input label="Your Name" placeholder="John Doe" required />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              helperText="We'll never share your email"
            />

            <Input label="Subject" placeholder="What's this about?" />

            <Textarea
              label="Message"
              placeholder="Your message here..."
              required
              rows={5}
              maxLength={500}
              showCharCount
              helperText="Please provide as much detail as possible"
            />

            <div className="flex gap-4">
              <Button variant="ghost">Cancel</Button>
              <Button>Send Message</Button>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary border-t border-light-border dark:border-dark-border pt-8">
          <p>
            All components include proper ARIA attributes, validation states, and dark mode support.
            Toggle dark mode to see theme adaptation.
          </p>
        </div>
      </div>
    </div>
  );
}
