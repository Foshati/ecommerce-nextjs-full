import { GoogleSignInButton } from '@/components/auth/google-signin-button'
import { GitHubSignInButton } from '@/components/auth/github-signin-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <GoogleSignInButton />
          <GitHubSignInButton />
        </CardContent>
      </Card>
    </div>
  )
}