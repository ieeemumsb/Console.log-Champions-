import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Dashboard() {
  
  const user = await currentUser();



  return (
    
    <div className="flex flex-col min-h-screen ">
      <div className="container flex flex-col justify-between px-4 py-5 w-5/6 backdrop-blur-sm bg-white/10 border-b border-b-gray-200 mx-auto">
          
          <div>
            <h1>Welcome , {user?.firstName}</h1>
            <p className="text-muted-foreground">Here's a summary of your financial activities.</p>
          </div>
          <div>

          </div>
          
      </div>
    </div>
  )
}