import { AlertCircle, ImagePlus, Mail, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
} from '@/components/ui-next';

export const DialogExamplesPage = () => {
  const [basicOpen, setBasicOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [scrollOpen, setScrollOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [nestedInnerOpen, setNestedInnerOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const handleDelete = () => {
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      setConfirmOpen(false);
      alert('Account deleted!');
    }, 1500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSendLoading(true);
    setTimeout(() => {
      setSendLoading(false);
      setFormOpen(false);
      setEmail('');
      setSubject('');
      setMessage('');
      alert('Email sent!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dim:bg-gray-800 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dim:text-gray-100 dark:text-white mb-2">
            Dialog / Modal Component
          </h1>
          <p className="text-lg text-gray-600 dim:text-gray-500 dark:text-gray-400">
            Accessible modal dialogs built with Radix UI primitives. Supports keyboard navigation,
            focus trapping, and smooth animations.
          </p>
        </div>

        {/* Section 1: Basic Dialog */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white mb-4">
            1. Basic Dialog
          </h2>
          <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 mb-4">
            Simple dialog with title, description, and action buttons.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Dialog open={basicOpen} onOpenChange={setBasicOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">Open Basic Dialog</Button>
              </DialogTrigger>
              <DialogContent size="md">
                <DialogHeader>
                  <DialogTitle>Welcome to VibesApp</DialogTitle>
                  <DialogDescription>
                    This is a basic dialog example. It has a title, description, and action buttons.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p className="text-sm">
                    You can press ESC to close, click the X button, or click outside the dialog. The
                    dialog is fully accessible and supports keyboard navigation.
                  </p>
                </DialogBody>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBasicOpen(false)}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => setBasicOpen(false)}>
                    Got it
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Section 2: Confirmation Dialog */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white mb-4">
            2. Confirmation Dialog
          </h2>
          <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 mb-4">
            Destructive action confirmation with warning icon and loading state.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" leftIcon={<Trash2 className="h-4 w-4" />}>
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent size="sm">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 dim:bg-red-800/30 dark:bg-red-900/30 p-3">
                      <AlertCircle className="h-6 w-6 text-red-600 dim:text-red-500 dark:text-red-400" />
                    </div>
                    <DialogTitle>Delete Account?</DialogTitle>
                  </div>
                  <DialogDescription>
                    This action cannot be undone. Your account and all associated data will be
                    permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    loading={deleteLoading}
                    disabled={deleteLoading}
                  >
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Section 3: Form Dialog */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white mb-4">
            3. Form Dialog
          </h2>
          <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 mb-4">
            Dialog with form inputs for data collection.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button variant="primary" leftIcon={<Mail className="h-4 w-4" />}>
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent size="md">
                <form onSubmit={handleSendEmail}>
                  <DialogHeader>
                    <DialogTitle>Send Email</DialogTitle>
                    <DialogDescription>
                      Fill in the form below to send an email message.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email" required>
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="user@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject" required>
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          type="text"
                          placeholder="Email subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" required>
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Type your message here..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={sendLoading}>
                      Send Email
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Section 4: Dialog Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white mb-4">
            4. Dialog Sizes
          </h2>
          <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 mb-4">
            Four size options: sm (400px), md (600px), lg (800px), full (95vw).
          </p>
          <div className="flex gap-4 flex-wrap">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Small (sm)</Button>
              </DialogTrigger>
              <DialogContent size="sm">
                <DialogHeader>
                  <DialogTitle>Small Dialog</DialogTitle>
                  <DialogDescription>max-width: 400px (28rem)</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p>Perfect for quick confirmations, alerts, or simple forms.</p>
                </DialogBody>
                <DialogFooter>
                  <Button variant="primary">Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Medium (md)</Button>
              </DialogTrigger>
              <DialogContent size="md">
                <DialogHeader>
                  <DialogTitle>Medium Dialog (Default)</DialogTitle>
                  <DialogDescription>max-width: 600px (42rem)</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p>
                    The default size for most dialogs. Great for forms, detailed content, and
                    multi-step wizards.
                  </p>
                </DialogBody>
                <DialogFooter>
                  <Button variant="primary">Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Large (lg)</Button>
              </DialogTrigger>
              <DialogContent size="lg">
                <DialogHeader>
                  <DialogTitle>Large Dialog</DialogTitle>
                  <DialogDescription>max-width: 800px (56rem)</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p>
                    Use for complex forms, data tables, or content that requires more horizontal
                    space. Still leaves room on either side for context.
                  </p>
                </DialogBody>
                <DialogFooter>
                  <Button variant="primary">Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Full Screen (full)</Button>
              </DialogTrigger>
              <DialogContent size="full">
                <DialogHeader>
                  <DialogTitle>Full Screen Dialog</DialogTitle>
                  <DialogDescription>max-width: 95vw</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p className="mb-4">
                    Takes up almost the entire viewport width. Perfect for image viewers, video
                    players, or immersive experiences.
                  </p>
                  <div className="bg-gray-100 dim:bg-gray-600 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                    <ImagePlus className="h-16 w-16 text-gray-400" />
                  </div>
                </DialogBody>
                <DialogFooter>
                  <Button variant="primary">Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Section 5: Scrollable Content */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white mb-4">
            5. Scrollable Content
          </h2>
          <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 mb-4">
            Dialog with long content that scrolls within max-height (90vh).
          </p>
          <div className="flex gap-4 flex-wrap">
            <Dialog open={scrollOpen} onOpenChange={setScrollOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">Open Scrollable Dialog</Button>
              </DialogTrigger>
              <DialogContent size="md">
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                  <DialogDescription>
                    Please read and accept our terms of service.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <div className="space-y-4 text-sm">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                      nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                      eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                      in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <p>
                      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                      doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                      veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                    <p>
                      Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
                      sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                      Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
                      adipisci velit.
                    </p>
                    <p>
                      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis
                      praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias
                      excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui
                      officia deserunt mollitia animi, id est laborum et dolorum fuga.
                    </p>
                    <p>
                      Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore,
                      cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod
                      maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor
                      repellendus.
                    </p>
                    <p>
                      Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus
                      saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
                      Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
                      voluptatibus maiores alias consequatur aut perferendis doloribus asperiores
                      repellat.
                    </p>
                  </div>
                </DialogBody>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setScrollOpen(false)}>
                    Decline
                  </Button>
                  <Button variant="primary" onClick={() => setScrollOpen(false)}>
                    Accept
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Section 6: Image Preview Dialog */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white mb-4">
            6. Image Preview Dialog
          </h2>
          <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 mb-4">
            Full-size dialog without padding for image preview.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Dialog open={imageOpen} onOpenChange={setImageOpen}>
              <DialogTrigger asChild>
                <Button variant="primary" leftIcon={<ImagePlus className="h-4 w-4" />}>
                  View Image
                </Button>
              </DialogTrigger>
              <DialogContent size="lg" className="p-0">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
                    alt="Mountain landscape"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 rounded-b-2xl">
                    <h3 className="text-white text-xl font-semibold mb-1">Mountain Landscape</h3>
                    <p className="text-gray-200 text-sm">Photo by nature photographer</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Section 7: Nested Dialogs */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white mb-4">
            7. Nested Dialogs
          </h2>
          <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 mb-4">
            You can nest dialogs for multi-step confirmations (use sparingly).
          </p>
          <div className="flex gap-4 flex-wrap">
            <Dialog open={nestedOpen} onOpenChange={setNestedOpen}>
              <DialogTrigger asChild>
                <Button variant="primary" leftIcon={<Settings className="h-4 w-4" />}>
                  Open Settings
                </Button>
              </DialogTrigger>
              <DialogContent size="md">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>Manage your account settings here.</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p className="mb-4">
                    Here are your current settings. You can change your password, email preferences,
                    and more.
                  </p>

                  <Dialog open={nestedInnerOpen} onOpenChange={setNestedInnerOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete All Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent size="sm">
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This will permanently delete all your data. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNestedInnerOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setNestedInnerOpen(false);
                            setNestedOpen(false);
                            alert('Data deleted!');
                          }}
                        >
                          Yes, delete everything
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DialogBody>
                <DialogFooter>
                  <Button variant="primary" onClick={() => setNestedOpen(false)}>
                    Close Settings
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Section 8: No Close Button */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white mb-4">
            8. Dialog Without Close Button
          </h2>
          <p className="text-gray-600 dim:text-gray-500 dark:text-gray-400 mb-4">
            Force user to take an action by hiding the close button (showClose=false).
          </p>
          <div className="flex gap-4 flex-wrap">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Forced Action</Button>
              </DialogTrigger>
              <DialogContent size="sm" showClose={false}>
                <DialogHeader>
                  <DialogTitle>Action Required</DialogTitle>
                  <DialogDescription>
                    You must select an option to continue. ESC and clicking outside are disabled.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p className="text-sm">
                    This dialog has showClose=false, which removes the X button and disables ESC and
                    click-outside-to-close.
                  </p>
                </DialogBody>
                <DialogFooter>
                  <Button variant="outline">Option A</Button>
                  <Button variant="primary">Option B</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Accessibility Notes */}
        <section className="mb-12 p-6 bg-blue-50 dim:bg-blue-800/20 dark:bg-blue-900/20 rounded-lg border border-blue-200 dim:border-blue-700 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-blue-900 dim:text-blue-100 dark:text-blue-100 mb-3">
            ♿ Accessibility Features
          </h2>
          <ul className="space-y-2 text-sm text-blue-800 dim:text-blue-200 dark:text-blue-200">
            <li>✅ Keyboard navigation (Tab, Shift+Tab, ESC to close)</li>
            <li>✅ Focus trap - focus stays inside dialog</li>
            <li>✅ Focus restoration - returns focus after close</li>
            <li>✅ ARIA attributes (role, aria-modal, aria-labelledby, aria-describedby)</li>
            <li>✅ Screen reader announcements</li>
            <li>✅ Backdrop click to close (can be disabled)</li>
            <li>✅ ESC key to close (can be disabled with showClose=false)</li>
            <li>✅ Smooth animations with reduced motion support</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DialogExamplesPage;
