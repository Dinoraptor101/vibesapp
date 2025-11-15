/**
 * Card Component Examples Page
 *
 * Comprehensive showcase of Card component with all variants and use cases.
 * Demonstrates composable sub-components, hover effects, and clickable cards.
 */

import { Calendar, Heart, MapPin, MessageCircle, MoreVertical, Share2, User } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui-next/Avatar';
import { Badge } from '@/components/ui-next/Badge';
import { Button } from '@/components/ui-next/Button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui-next/Card';

export function CardExamplesPage() {
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-light-bg-base dim:bg-dim-bg-base dark:bg-dark-bg-base p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
            Card Component
          </h1>
          <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary text-lg">
            Composable cards with headers, content, and footers
          </p>
        </div>

        {/* Basic Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Basic Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent>
                <p className="text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  Simple card with just content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  Card with Header
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  This card has a header section
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  Complete Card
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  With header, content, and footer
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">
                  Action
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Hoverable Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Hoverable Cards
          </h2>
          <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
            Cards with hover lift effect and shadow enhancement
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable>
              <CardContent>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary mb-2">
                  Hover Me
                </h3>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  This card lifts on hover
                </p>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardHeader>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  With Header
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  Hover to see the effect
                </p>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                    alt="User"
                    size="md"
                  />
                  <div>
                    <h4 className="font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                      John Doe
                    </h4>
                    <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                      @johndoe
                    </p>
                  </div>
                </div>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  Profile card with avatar
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Clickable Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Clickable Cards
          </h2>
          <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
            Cards with onClick handlers (cursor pointer, keyboard accessible)
          </p>
          {clickedCard && (
            <div className="p-4 bg-success/10 border border-success rounded-lg text-success">
              You clicked: {clickedCard}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable onClick={() => setClickedCard('Card 1')}>
              <CardContent>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary mb-2">
                  Click Me
                </h3>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  This entire card is clickable
                </p>
              </CardContent>
            </Card>

            <Card hoverable onClick={() => setClickedCard('Card 2')}>
              <CardHeader>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  Navigation Card
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  Try keyboard navigation (Tab + Enter)
                </p>
              </CardContent>
            </Card>

            <Card hoverable onClick={() => setClickedCard('Card 3')}>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                    Action Card
                  </h3>
                  <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary mt-1">
                    Click to perform action
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Image Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Image Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card noPadding hoverable>
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
                alt="Mountain landscape"
                className="w-full h-48 object-cover"
              />
              <CardContent>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary mb-2">
                  Mountain Vista
                </h3>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  Beautiful mountain landscape
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" leftIcon={<Heart />} variant="ghost">
                  Like
                </Button>
                <Button size="sm" leftIcon={<Share2 />} variant="ghost">
                  Share
                </Button>
              </CardFooter>
            </Card>

            <Card noPadding hoverable>
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop"
                alt="Forest path"
                className="w-full h-48 object-cover"
              />
              <CardContent>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary mb-2">
                  Forest Trail
                </h3>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  Peaceful forest walkway
                </p>
              </CardContent>
            </Card>

            <Card noPadding hoverable>
              <img
                src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop"
                alt="Sunset"
                className="w-full h-48 object-cover"
              />
              <CardContent>
                <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary mb-2">
                  Golden Hour
                </h3>
                <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  Stunning sunset view
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Social Media Post Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Social Media Post Cards
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                      alt="John Doe"
                      size="md"
                    />
                    <div>
                      <h4 className="font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                        John Doe
                      </h4>
                      <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" leftIcon={<MoreVertical />} />
                </div>
              </CardHeader>
              <CardContent noPadding>
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                  alt="Post"
                  className="w-full object-cover"
                />
                <div className="p-6">
                  <p className="text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                    Amazing view from my hike today! 🏔️ The weather was perfect and the scenery was
                    breathtaking.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" leftIcon={<Heart />} variant="ghost">
                  24
                </Button>
                <Button size="sm" leftIcon={<MessageCircle />} variant="ghost">
                  8
                </Button>
                <Button size="sm" leftIcon={<Share2 />} variant="ghost">
                  Share
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                      alt="Jane Smith"
                      size="md"
                    />
                    <div>
                      <h4 className="font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                        Jane Smith
                      </h4>
                      <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                        5 hours ago
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Following</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary mb-4">
                  Just finished reading an amazing book! Highly recommend "The Midnight Library" by
                  Matt Haig 📚✨
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">#books</Badge>
                  <Badge variant="default">#reading</Badge>
                  <Badge variant="default">#recommendations</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" leftIcon={<Heart />} variant="ghost">
                  156
                </Button>
                <Button size="sm" leftIcon={<MessageCircle />} variant="ghost">
                  23
                </Button>
                <Button size="sm" leftIcon={<Share2 />} variant="ghost">
                  Share
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Profile Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Profile Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable>
              <CardContent>
                <div className="text-center">
                  <Avatar
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                    alt="John Doe"
                    size="lg"
                    className="mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                    John Doe
                  </h3>
                  <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary mb-4">
                    @johndoe
                  </p>
                  <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                    <div>
                      <div className="font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                        1.2K
                      </div>
                      <div className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                        Followers
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                        432
                      </div>
                      <div className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                        Following
                      </div>
                    </div>
                  </div>
                  <Button fullWidth variant="secondary">
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                    Jane Smith
                  </h3>
                  <Badge variant="default">INTJ</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                    alt="Jane Smith"
                    size="lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary mb-2">
                      Designer & Creative
                    </p>
                    <div className="flex items-center gap-3 text-xs text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        San Francisco
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined 2024
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                  Passionate about design and creativity. Always learning, always growing.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" fullWidth>
                  View Profile
                </Button>
              </CardFooter>
            </Card>

            <Card hoverable>
              <CardContent>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                    alt="Mike Johnson"
                    size="md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                      Mike Johnson
                    </h4>
                    <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                      Software Engineer
                    </p>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>
                <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary mb-4">
                  Building amazing things with code. Open to freelance opportunities.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" fullWidth>
                    Message
                  </Button>
                  <Button size="sm" fullWidth>
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Statistics Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card hoverable>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                    Total Users
                  </p>
                  <User className="w-5 h-5 text-brand" />
                </div>
                <h3 className="text-3xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  12,543
                </h3>
                <p className="text-sm text-success mt-1">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                    Active Posts
                  </p>
                  <MessageCircle className="w-5 h-5 text-brand" />
                </div>
                <h3 className="text-3xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  8,234
                </h3>
                <p className="text-sm text-success mt-1">+8.1% from last month</p>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                    Engagement
                  </p>
                  <Heart className="w-5 h-5 text-brand" />
                </div>
                <h3 className="text-3xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  94.2%
                </h3>
                <p className="text-sm text-success mt-1">+2.3% from last month</p>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                    Total Shares
                  </p>
                  <Share2 className="w-5 h-5 text-brand" />
                </div>
                <h3 className="text-3xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                  3,456
                </h3>
                <p className="text-sm text-error mt-1">-5.2% from last month</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary border-t border-light-border dim:border-dim-border dark:border-dark-border pt-8">
          <p>
            All cards support dark mode, composable sections, and are fully accessible. Hover over
            hoverable cards to see the lift effect.
          </p>
        </div>
      </div>
    </div>
  );
}
