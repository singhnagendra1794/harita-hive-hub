
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RefundPolicy = () => {
  return (
    <Layout>
    <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Satisfaction Guarantee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid subscriptions. If you're not 
                completely satisfied with Harita Hive, you can request a full refund within 30 days 
                of your initial purchase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Eligible for Refund:</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Professional and Enterprise subscription plans</li>
                  <li>• Course purchases within 30 days</li>
                  <li>• Certification fees (if certification not yet completed)</li>
                  <li>• Premium tool downloads (if not yet downloaded)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Not Eligible for Refund:</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Free tier services</li>
                  <li>• Completed certifications</li>
                  <li>• Downloaded tools and resources</li>
                  <li>• Services used extensively ({'>'}30 days of active usage)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Request a Refund</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To request a refund, please contact our support team:
              </p>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:refunds@haritahive.com" className="text-primary hover:underline">refunds@haritahive.com</a>
                </p>
                <p className="text-muted-foreground">
                  <strong>Subject:</strong> Refund Request - [Your Account Email]
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Include in your request:</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Your account email address</li>
                  <li>• Order/transaction ID</li>
                  <li>• Reason for refund request</li>
                  <li>• Date of original purchase</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Times</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Review:</strong> 1-2 business days</li>
                <li>• <strong>Approval:</strong> Email confirmation sent</li>
                <li>• <strong>Processing:</strong> 3-5 business days</li>
                <li>• <strong>Credit to account:</strong> 5-10 business days (depending on payment method)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro-rated Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For annual subscriptions canceled after the 30-day window, we offer pro-rated refunds 
                based on unused months, minus any promotional discounts applied. Monthly subscriptions 
                can be canceled at any time with no future charges.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For questions about our refund policy or to request a refund, contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground">
                  <strong>Refunds Team:</strong> <a href="mailto:refunds@haritahive.com" className="text-primary hover:underline">refunds@haritahive.com</a>
                </p>
                <p className="text-muted-foreground">
                  <strong>General Support:</strong> <a href="mailto:support@haritahive.com" className="text-primary hover:underline">support@haritahive.com</a>
                </p>
                <p className="text-muted-foreground">
                  <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;