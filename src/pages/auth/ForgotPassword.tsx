import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ForgotPassword</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">En développement</p>
        </CardContent>
      </Card>
    </div>
  );
}
