import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubscriptionModal } from '@/components/modals';

const SubscriptionRestrictedView = () => {
  return (
    <Container>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Subscription Required</CardTitle>
            <CardDescription>
              Your subscription is currently inactive. Please reactivate to continue using the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              All features are currently restricted due to inactive subscription status.
            </p>
            <p className="text-xs text-gray-500">
              The subscription modal will guide you through reactivation.
            </p>
          </CardContent>
        </Card>
      </div>
      <SubscriptionModal isOpen={true} />
    </Container>
  );
};

export { SubscriptionRestrictedView };