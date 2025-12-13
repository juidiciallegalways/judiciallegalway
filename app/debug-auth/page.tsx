import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RefreshCw, Home } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DebugAuthPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login?next=/debug-auth")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Auth Debug Information</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <pre className="bg-background p-4 rounded overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          {profile ? (
            <>
              <pre className="bg-background p-4 rounded overflow-auto text-sm mb-4">
                {JSON.stringify(profile, null, 2)}
              </pre>
              <div className="space-y-2">
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Role:</strong> <span className="font-mono bg-primary text-primary-foreground px-2 py-1 rounded">{profile.role}</span></p>
                <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
                <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
              </div>
            </>
          ) : (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded">
              <p className="font-semibold">⚠️ No profile found!</p>
              <p className="text-sm mt-2">This means your profile hasn't been created yet. Try signing out and signing back in.</p>
            </div>
          )}
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Access Levels</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {profile?.role === 'admin' ? '✅' : '❌'}
              <span>Admin Access</span>
            </div>
            <div className="flex items-center gap-2">
              {profile?.role === 'lawyer' || profile?.role === 'admin' ? '✅' : '❌'}
              <span>Lawyer Access</span>
            </div>
            <div className="flex items-center gap-2">
              ✅
              <span>Student Access (Everyone)</span>
            </div>
          </div>
        </div>

        {profile?.role !== 'admin' && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Become Admin</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to Supabase Dashboard</li>
              <li>Navigate to Table Editor → profiles</li>
              <li>Find your email: <code className="bg-background px-2 py-1 rounded">{user.email}</code></li>
              <li>Click on the row to edit</li>
              <li>Change <code className="bg-background px-2 py-1 rounded">role</code> from <code className="bg-background px-2 py-1 rounded">{profile?.role || 'student'}</code> to <code className="bg-background px-2 py-1 rounded">admin</code></li>
              <li>Save the change</li>
              <li>Sign out and sign back in</li>
            </ol>
            <p className="mt-4 text-sm text-muted-foreground">
              Or run this SQL in Supabase SQL Editor:
            </p>
            <pre className="bg-background p-4 rounded mt-2 text-sm overflow-auto">
{`UPDATE public.profiles 
SET role = 'admin' 
WHERE email = '${user.email}';`}
            </pre>
          </div>
        )}

        {profile?.role === 'admin' && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">✅ You are an Admin!</h2>
            <p>You should be able to access the admin panel at <a href="/admin" className="text-primary underline">/admin</a></p>
            <p className="text-sm text-muted-foreground mt-2">
              If you still can't access it, try signing out and signing back in, or check the browser console for errors.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
