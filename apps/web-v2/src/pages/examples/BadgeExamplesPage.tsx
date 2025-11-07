import { Badge } from '@/components/ui-next';
import { Card, CardHeader, CardContent } from '@/components/ui-next/Card';
import { Avatar } from '@/components/ui-next/Avatar';
import { Bell, MessageSquare, Mail } from 'lucide-react';

export default function BadgeExamplesPage() {
  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Badge Component</h1>
          <p className="text-text-secondary">
            Display labels, status indicators, counts, and MBTI personality types.
          </p>
        </div>

        {/* All Variants */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Variants</h2>
            <p className="text-sm text-text-secondary">
              Available variants: default, success, warning, error, brand
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="brand">Brand</Badge>
            </div>
          </CardContent>
        </Card>

        {/* All Sizes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Sizes</h2>
            <p className="text-sm text-text-secondary">Available sizes: sm (default), md, lg</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge size="sm">Small Badge</Badge>
                <Badge size="md">Medium Badge</Badge>
                <Badge size="lg">Large Badge</Badge>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge size="sm" variant="brand">
                  Small
                </Badge>
                <Badge size="md" variant="brand">
                  Medium
                </Badge>
                <Badge size="lg" variant="brand">
                  Large
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dot Variant */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Dot Indicators</h2>
            <p className="text-sm text-text-secondary">
              Use <code className="px-1 py-0.5 bg-surface-secondary rounded">dot</code> prop for
              status indicators
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Different variants</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" dot />
                    <span className="text-sm text-text-secondary">Default</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" dot />
                    <span className="text-sm text-text-secondary">Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" dot />
                    <span className="text-sm text-text-secondary">Away</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="error" dot />
                    <span className="text-sm text-text-secondary">Offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" dot />
                    <span className="text-sm text-text-secondary">Premium</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Different sizes</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="success" dot size="sm" />
                  <Badge variant="success" dot size="md" />
                  <Badge variant="success" dot size="lg" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Number Badges */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Number Badges (Counts)</h2>
            <p className="text-sm text-text-secondary">
              Use <code className="px-1 py-0.5 bg-surface-secondary rounded">count</code> prop for
              notification counts
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Different counts</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="error" count={3} />
                  <Badge variant="error" count={12} />
                  <Badge variant="error" count={99} />
                  <Badge variant="error" count={100} />
                  <Badge variant="error" count={999} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Different variants</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="default" count={5} />
                  <Badge variant="success" count={3} />
                  <Badge variant="warning" count={7} />
                  <Badge variant="error" count={12} />
                  <Badge variant="brand" count={99} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Different sizes</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="error" count={42} size="sm" />
                  <Badge variant="error" count={42} size="md" />
                  <Badge variant="error" count={42} size="lg" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Custom maxCount</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="brand" count={50} maxCount={99} />
                  <Badge variant="brand" count={50} maxCount={49} />
                  <Badge variant="brand" count={1000} maxCount={999} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MBTI Badges */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">MBTI Personality Types</h2>
            <p className="text-sm text-text-secondary">
              Common use case: displaying personality types
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {[
                'INTJ',
                'INTP',
                'ENTJ',
                'ENTP',
                'INFJ',
                'INFP',
                'ENFJ',
                'ENFP',
                'ISTJ',
                'ISFJ',
                'ESTJ',
                'ESFJ',
                'ISTP',
                'ISFP',
                'ESTP',
                'ESFP',
              ].map((type) => (
                <Badge key={type} variant="brand" size="md">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Labels */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Status Labels</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="error">Banned</Badge>
              <Badge variant="default">Inactive</Badge>
              <Badge variant="brand">Premium</Badge>
              <Badge variant="success">Verified</Badge>
              <Badge variant="error">Flagged</Badge>
              <Badge variant="warning">Under Review</Badge>
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
              {/* Navigation with badges */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Navigation with notification counts
                </h3>
                <div className="flex gap-6 p-4 bg-surface-secondary rounded-lg">
                  <button
                    type="button"
                    className="relative flex items-center gap-2 text-text-primary hover:text-brand-primary transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span>Activity</span>
                    <Badge variant="error" count={5} size="sm" />
                  </button>
                  <button
                    type="button"
                    className="relative flex items-center gap-2 text-text-primary hover:text-brand-primary transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                    <Badge variant="brand" count={12} size="sm" />
                  </button>
                  <button
                    type="button"
                    className="relative flex items-center gap-2 text-text-primary hover:text-brand-primary transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Inbox</span>
                    <Badge variant="success" count={3} size="sm" />
                  </button>
                </div>
              </div>

              {/* User profile with badges */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  User profiles with status
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: 'Sarah Johnson',
                      mbti: 'INFP',
                      status: 'success',
                      statusText: 'Active',
                    },
                    { name: 'Mike Chen', mbti: 'ENTJ', status: 'warning', statusText: 'Away' },
                    { name: 'Emma Wilson', mbti: 'ISFJ', status: 'error', statusText: 'Banned' },
                  ].map((user) => (
                    <div
                      key={user.name}
                      className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg"
                    >
                      <div className="relative">
                        <Avatar name={user.name} size="md" />
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <Badge
                            variant={user.status as 'success' | 'warning' | 'error'}
                            dot
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">{user.name}</span>
                          <Badge variant="brand" size="sm">
                            {user.mbti}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">{user.statusText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post tags */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Post tags and categories
                </h3>
                <div className="p-4 bg-surface-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">My weekend adventure 🏔️</h4>
                  <p className="text-sm text-text-secondary mb-3">
                    Had an amazing time hiking in the mountains this weekend...
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="brand" size="sm">
                      Travel
                    </Badge>
                    <Badge variant="success" size="sm">
                      Outdoors
                    </Badge>
                    <Badge variant="default" size="sm">
                      Photography
                    </Badge>
                    <Badge variant="brand" size="sm">
                      Nature
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Message threads */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Message threads with unread counts
                </h3>
                <div className="space-y-2">
                  {[
                    { name: 'Design Team', unread: 3, priority: false },
                    { name: 'Project Updates', unread: 127, priority: true },
                    { name: 'Random Chat', unread: 0, priority: false },
                    { name: 'Important Announcements', unread: 5, priority: true },
                  ].map((thread) => (
                    <div
                      key={thread.name}
                      className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-text-secondary" />
                        <span className="font-medium text-text-primary">{thread.name}</span>
                        {thread.priority && (
                          <Badge variant="warning" size="sm">
                            Priority
                          </Badge>
                        )}
                      </div>
                      {thread.unread > 0 && (
                        <Badge
                          variant={thread.priority ? 'error' : 'brand'}
                          count={thread.unread}
                          size="sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature flags */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Feature labels and states
                </h3>
                <div className="space-y-2">
                  {[
                    { feature: 'Dark Mode', status: 'success', label: 'Stable' },
                    { feature: 'Real-time Messaging', status: 'success', label: 'Live' },
                    { feature: 'Group Chat', status: 'warning', label: 'Beta' },
                    { feature: 'Voice Messages', status: 'brand', label: 'Coming Soon' },
                    { feature: 'Video Calls', status: 'default', label: 'Planned' },
                  ].map((item) => (
                    <div
                      key={item.feature}
                      className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg"
                    >
                      <span className="text-text-primary">{item.feature}</span>
                      <Badge
                        variant={item.status as 'success' | 'warning' | 'brand' | 'default'}
                        size="sm"
                      >
                        {item.label}
                      </Badge>
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
                <h3 className="font-medium text-text-primary mb-2">Basic badge</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Badge>Default</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="brand" size="lg">INFP</Badge>`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Dot indicator</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Badge variant="success" dot />
<Badge variant="warning" dot size="md" />`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Number badge with count</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Badge variant="error" count={5} />
<Badge variant="brand" count={127} />
<Badge variant="error" count={1000} maxCount={999} />`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">With icons/buttons</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<button className="relative">
  <Bell className="w-5 h-5" />
  <Badge variant="error" count={3} />
</button>`}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
