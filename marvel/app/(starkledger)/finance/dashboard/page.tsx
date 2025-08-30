import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Dashboard() {
  
  const user = await currentUser();



  return (
    
    <div>WELCOME TO THE FINANCE DPT</div>
  )
}