import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StripePaymentFormProps } from '@/types';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '@/services/paymentService';

// Make sure to add your Stripe publishable key to your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onCancel, clientSecret }: { amount: number; onSuccess: () => void; onCancel: () => void; clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cardElement = elements?.getElement(CardElement);

    if (!stripe || !elements || !cardElement) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        // You can add billing details here if you collect them
        // billing_details: {
        //   name: 'Jenny Rosen',
        // },
      },
    });


    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        // Confirm payment on our backend
        await paymentService.confirmPayment({ paymentIntentId: paymentIntent.id });
        toast({
          title: 'Payment Successful!',
          description: `Your payment of $${amount} has been processed.`,
        });
        onSuccess();
      } catch (backendError) {
        toast({
          title: 'Confirmation Error',
          description: 'Payment was successful but failed to confirm on our server. Please contact support.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Payment Failed',
        description: 'Your payment could not be processed. Please try again.',
        variant: 'destructive',
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-3 border rounded-md">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', '::placeholder': { color: '#aab7c4' } },
          }
        }} />
      </div>

      {errorMessage && <div className="text-destructive text-sm">{errorMessage}</div>}

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Total Amount</span>
          <span className="text-2xl font-bold">${amount}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Lock className="h-3 w-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-gradient-sunset hover:shadow-glow" disabled={isProcessing || !stripe || !elements}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay $${amount}`}
          </Button>
        </div>
      </div>
    </form>
  );
};

const StripePaymentForm = ({ clientSecret, amount, onSuccess, onCancel, bookingId }: StripePaymentFormProps) => {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
    loader: 'never', // This will hide the Stripe developer widget
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} clientSecret={clientSecret} />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
