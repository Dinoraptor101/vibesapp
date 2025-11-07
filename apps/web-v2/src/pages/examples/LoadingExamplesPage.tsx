import { Spinner, Skeleton } from '@/components/ui-next';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui-next/Card';
import { Button } from '@/components/ui-next/Button';
import { Avatar } from '@/components/ui-next/Avatar';
import { Badge } from '@/components/ui-next/Badge';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

export default function LoadingExamplesPage() {
  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Loading Components</h1>
          <p className="text-text-secondary">
            Spinner and Skeleton components for loading states and placeholders.
          </p>
        </div>

        {/* Spinner Sizes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Spinner Sizes</h2>
            <p className="text-sm text-text-secondary">Available sizes: sm, md (default), lg, xl</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="sm" />
                <span className="text-xs text-text-secondary">sm (16px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="md" />
                <span className="text-xs text-text-secondary">md (24px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <span className="text-xs text-text-secondary">lg (32px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="xl" />
                <span className="text-xs text-text-secondary">xl (48px)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spinner Variants */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Spinner Color Variants</h2>
            <p className="text-sm text-text-secondary">
              Available variants: default, primary, success, error, white
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Spinner variant="default" />
                  <span className="text-xs text-text-secondary">default</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner variant="primary" />
                  <span className="text-xs text-text-secondary">primary</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner variant="success" />
                  <span className="text-xs text-text-secondary">success</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner variant="error" />
                  <span className="text-xs text-text-secondary">error</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Spinner variant="white" />
                  <span className="text-xs text-white">white (on dark)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spinner in Buttons */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Spinner in Buttons</h2>
            <p className="text-sm text-text-secondary">Common use case: loading buttons</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button loading>Primary Loading</Button>
              <Button variant="secondary" loading>
                Secondary Loading
              </Button>
              <Button variant="outline" loading>
                Outline Loading
              </Button>
              <Button variant="ghost" loading>
                Ghost Loading
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Variants */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Skeleton Variants</h2>
            <p className="text-sm text-text-secondary">
              Available variants: default (rectangle), text, circle
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">Text lines</h3>
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-3/4" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Circles (for avatars)
                </h3>
                <div className="flex gap-2">
                  <Skeleton variant="circle" className="w-8 h-8" />
                  <Skeleton variant="circle" className="w-10 h-10" />
                  <Skeleton variant="circle" className="w-12 h-12" />
                  <Skeleton variant="circle" className="w-16 h-16" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">Rectangles</h3>
                <div className="space-y-2">
                  <Skeleton variant="rectangle" className="w-full h-32" />
                  <Skeleton variant="rectangle" className="w-64 h-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Post Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Skeleton Post Card</h2>
            <p className="text-sm text-text-secondary">
              Example: Loading state for a social media post
            </p>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton variant="circle" className="w-12 h-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-32" />
                    <Skeleton variant="text" className="w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-2/3" />
                  <Skeleton variant="rectangle" className="w-full h-64 mt-4" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-4 w-full">
                  <Skeleton variant="rectangle" className="w-16 h-8" />
                  <Skeleton variant="rectangle" className="w-16 h-8" />
                  <Skeleton variant="rectangle" className="w-16 h-8" />
                </div>
              </CardFooter>
            </Card>
          </CardContent>
        </Card>

        {/* Skeleton User Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Skeleton User Card</h2>
            <p className="text-sm text-text-secondary">
              Example: Loading state for user profile cards
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-3">
                      <Skeleton variant="circle" className="w-20 h-20" />
                      <Skeleton variant="text" className="w-32" />
                      <Skeleton variant="text" className="w-24" />
                      <div className="flex gap-2 mt-2">
                        <Skeleton variant="rectangle" className="w-16 h-6" />
                        <Skeleton variant="rectangle" className="w-16 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-World Comparison */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Before & After Loading</h2>
            <p className="text-sm text-text-secondary">
              Side-by-side comparison of skeleton vs loaded content
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loading State */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">Loading State</h3>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circle" className="w-10 h-10" />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-28" />
                        <Skeleton variant="text" className="w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <Skeleton variant="text" className="w-full" />
                      <Skeleton variant="text" className="w-full" />
                      <Skeleton variant="text" className="w-3/4" />
                    </div>
                    <Skeleton variant="rectangle" className="w-full h-48" />
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-4 w-full">
                      <Skeleton variant="rectangle" className="w-12 h-8" />
                      <Skeleton variant="rectangle" className="w-12 h-8" />
                      <Skeleton variant="rectangle" className="w-12 h-8" />
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Loaded State */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">Loaded State</h3>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar name="Sarah Johnson" size="md" online />
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary">Sarah Johnson</h3>
                        <p className="text-sm text-text-secondary">2 hours ago</p>
                      </div>
                      <Badge variant="brand" size="sm">
                        INFP
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-primary mb-4">
                      Just had the most amazing sunset hike! The views from the top were absolutely
                      breathtaking. 🌅
                    </p>
                    <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg" />
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-4 w-full">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-text-secondary hover:text-vibe-positive transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">24</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-text-secondary hover:text-brand-primary transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">5</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-text-secondary hover:text-brand-primary transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page Loading State */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">Full Page Loading</h2>
            <p className="text-sm text-text-secondary">
              Centered spinner for full-page loading states
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-surface-secondary rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Spinner size="xl" variant="primary" />
                <p className="text-text-secondary">Loading content...</p>
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
                <h3 className="font-medium text-text-primary mb-2">Basic spinner</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Spinner />
<Spinner size="lg" variant="primary" />`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Spinner in button</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Button loading>
  Saving...
</Button>`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Skeleton variants</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`// Text lines
<Skeleton variant="text" className="w-full" />
<Skeleton variant="text" className="w-3/4" />

// Circle (avatar)
<Skeleton variant="circle" className="w-12 h-12" />

// Rectangle (image)
<Skeleton variant="rectangle" className="w-full h-48" />`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Skeleton card composition</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<Card>
  <CardHeader>
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-32" />
        <Skeleton variant="text" className="w-24" />
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <Skeleton variant="text" className="w-full" />
    <Skeleton variant="text" className="w-full" />
    <Skeleton variant="text" className="w-2/3" />
    <Skeleton variant="rectangle" className="w-full h-64 mt-4" />
  </CardContent>
</Card>`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Full page loading</h3>
                <pre className="bg-surface-secondary p-3 rounded overflow-x-auto">
                  <code>{`<div className="flex items-center justify-center min-h-screen">
  <div className="flex flex-col items-center gap-3">
    <Spinner size="xl" variant="primary" />
    <p className="text-text-secondary">Loading...</p>
  </div>
</div>`}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
