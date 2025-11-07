import { Avatar } from '@/components/ui-next';
import { Card, CardHeader, CardContent } from '@/components/ui-next/Card';

export default function AvatarExamplesPage() {
  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Avatar Component</h1>
          <p className="text-text-secondary">
            Display user profile pictures with fallback to initials, online indicators, and loading
            states.
          </p>
        </div>

        {/* All Sizes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Sizes</h2>
            <p className="text-sm text-text-secondary">
              Available sizes: xs (32px), sm (40px), md (48px), lg (64px), xl (80px)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="User"
                  size="xs"
                />
                <span className="text-xs text-text-secondary">xs (32px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="User"
                  size="sm"
                />
                <span className="text-xs text-text-secondary">sm (40px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="User"
                  size="md"
                />
                <span className="text-xs text-text-secondary">md (48px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="User"
                  size="lg"
                />
                <span className="text-xs text-text-secondary">lg (64px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="User"
                  size="xl"
                />
                <span className="text-xs text-text-secondary">xl (80px)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Online Indicator */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Online Status Indicator</h2>
            <p className="text-sm text-text-secondary">
              Add <code className="px-1 py-0.5 bg-surface-secondary rounded">online</code> prop to
              show green dot indicator
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  alt="John Doe"
                  size="sm"
                  online
                />
                <span className="text-xs text-text-secondary">Online (sm)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
                  alt="Jane Smith"
                  size="md"
                  online
                />
                <span className="text-xs text-text-secondary">Online (md)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                  alt="Mike Johnson"
                  size="lg"
                  online
                />
                <span className="text-xs text-text-secondary">Online (lg)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                  alt="Sarah Williams"
                  size="xl"
                  online
                />
                <span className="text-xs text-text-secondary">Online (xl)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initials Fallback */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Initials Fallback</h2>
            <p className="text-sm text-text-secondary">
              When no image is provided, shows initials with auto-generated color
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">Using name prop</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar name="John Doe" size="md" />
                    <span className="text-xs text-text-secondary">John Doe</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar name="Jane Smith" size="md" />
                    <span className="text-xs text-text-secondary">Jane Smith</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar name="Mike Johnson" size="md" />
                    <span className="text-xs text-text-secondary">Mike Johnson</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar name="Sarah Williams" size="md" />
                    <span className="text-xs text-text-secondary">Sarah Williams</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar name="Alex" size="md" />
                    <span className="text-xs text-text-secondary">Alex (single name)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Different sizes with initials
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <Avatar name="Emma Wilson" size="xs" />
                  <Avatar name="Emma Wilson" size="sm" />
                  <Avatar name="Emma Wilson" size="md" />
                  <Avatar name="Emma Wilson" size="lg" />
                  <Avatar name="Emma Wilson" size="xl" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Initials with online indicator
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <Avatar name="David Brown" size="md" online />
                  <Avatar name="Emily Davis" size="md" online />
                  <Avatar name="Chris Taylor" size="md" online />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ring/Border */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Ring/Border Highlight</h2>
            <p className="text-sm text-text-secondary">
              Use <code className="px-1 py-0.5 bg-surface-secondary rounded">ring</code> prop to
              highlight important avatars
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Featured User"
                  size="md"
                  ring
                />
                <span className="text-xs text-text-secondary">With ring</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"
                  alt="Featured User"
                  size="lg"
                  ring
                  online
                />
                <span className="text-xs text-text-secondary">Ring + online</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar name="VIP User" size="lg" ring />
                <span className="text-xs text-text-secondary">Ring + initials</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Loading State</h2>
            <p className="text-sm text-text-secondary">Shows skeleton animation while loading</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <Avatar loading size="xs" />
              <Avatar loading size="sm" />
              <Avatar loading size="md" />
              <Avatar loading size="lg" />
              <Avatar loading size="xl" />
            </div>
          </CardContent>
        </Card>

        {/* Image Error Handling */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Broken Image Fallback</h2>
            <p className="text-sm text-text-secondary">
              Automatically falls back to initials when image fails to load
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <Avatar src="https://invalid-url.com/broken.jpg" name="Broken Image" size="md" />
                <span className="text-xs text-text-secondary">Invalid image URL</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://invalid-url.com/broken.jpg"
                  name="Error User"
                  size="md"
                  online
                />
                <span className="text-xs text-text-secondary">Error + online</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-World Examples */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Real-World Usage Examples</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* User Profile Header */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">Profile Header</h3>
                <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-lg">
                  <Avatar
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    alt="Sarah Johnson"
                    size="xl"
                    online
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Sarah Johnson</h3>
                    <p className="text-sm text-text-secondary">INFP • San Francisco, CA</p>
                    <p className="text-xs text-vibe-positive mt-1">● Online</p>
                  </div>
                </div>
              </div>

              {/* Message List Item */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">Message List</h3>
                <div className="space-y-2">
                  {[
                    {
                      name: 'Alex Turner',
                      message: 'Hey! Did you see the new post?',
                      time: '2m ago',
                      online: true,
                      unread: true,
                    },
                    {
                      name: 'Emma Watson',
                      message: 'Thanks for the vibes! 💜',
                      time: '1h ago',
                      online: false,
                      unread: false,
                    },
                    {
                      name: 'Chris Evans',
                      message: 'See you at the meetup tomorrow',
                      time: '3h ago',
                      online: true,
                      unread: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        item.unread ? 'bg-brand-primary/10' : 'bg-surface-secondary'
                      }`}
                    >
                      <Avatar name={item.name} size="md" online={item.online} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-medium ${
                              item.unread ? 'text-text-primary' : 'text-text-secondary'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-xs text-text-tertiary">{item.time}</span>
                        </div>
                        <p className="text-sm text-text-secondary truncate">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Grid */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">Nearby Users Grid</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    'Alice Cooper',
                    'Bob Dylan',
                    'Carol King',
                    'David Bowie',
                    'Eva Green',
                    'Frank Ocean',
                    'Grace Jones',
                    'Henry Rollins',
                  ].map((name, i) => (
                    <div key={name} className="flex flex-col items-center gap-2">
                      <Avatar name={name} size="lg" online={i % 3 === 0} />
                      <span className="text-xs text-text-secondary text-center truncate w-full">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Code Examples</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-text-primary mb-2">Basic usage</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Avatar src="/avatar.jpg" alt="John Doe" />`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">
                  With size and online indicator
                </h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Avatar 
  src="/avatar.jpg" 
  alt="Jane Smith" 
  size="lg" 
  online 
/>`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Initials fallback</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Avatar name="John Doe" size="md" />`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">With ring highlight</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Avatar 
  src="/avatar.jpg" 
  alt="Featured User" 
  size="lg" 
  ring 
/>`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Loading state</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Avatar loading size="md" />`}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
