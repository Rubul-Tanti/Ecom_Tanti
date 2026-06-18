'use client'
import { useUserContext } from '@/contextProvider'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { BsBag } from 'react-icons/bs'
import { RiAccountCircle2Line } from 'react-icons/ri'
import {  LogIn, LogOut, ShieldCheck, ShoppingBag, UserCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { handleLogout } from '@/server/authentication'
import { Button } from './ui/button'
import { CgProfile } from 'react-icons/cg'
import { Skeleton } from './ui/skeleton'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const { user,setUser } = useUserContext()
  const router=useRouter()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logout=async()=>{
    if(!user.isAuthenticated){
      return router.push('/signin')
    }
  const res=await handleLogout()
  setUser({role:null,userName:null,profilePicture:null,isAuthenticated:false,email:null,cartCount:0,isLoading:false})
  router.push('/signin')
  }
  console.log(user)
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        .nb-root {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: box-shadow 0.3s;
          font-family: 'Syne', sans-serif;
        }


     .nb-inner {
  max-width: 1400px;   /* was 2000px */
  // border-bottom: 1px solid rgba(0,0,0,0.07);
  margin: 0 auto;
  padding: 0 30px 0 34px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

        /* logo */
        .nb-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .nb-logo:hover { opacity: 0.7; }



        /* each action button */
        .nb-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          text-decoration: none;
          color: #0a0a0a;
          transition: background 0.15s;
          border-radius: 0;
        }

        .nb-btn:hover {
          background: #f4f4f4;
        }

        .nb-btn-icon {
          color: #0a0a0a;
          display: flex;
          align-items: center;
        }

        .nb-btn-label {
          font-family: 'Syne', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0a0a0a;
          line-height: 1;
        }

        /* cart badge */
        .nb-badge {
          position: absolute;
          top: 5px;
          right: 9px;
          background: #0a0a0a;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 8px;
          font-weight: 700;
          line-height: 1;
          padding: 2px 4px;
          border-radius: 999px;
          min-width: 15px;
          text-align: center;
        }

        /* active underline on hover */
        .nb-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #0a0a0a;
          transition: width 0.2s;
        }

        .nb-btn:hover::after {
          width: calc(100% - 16px);
        }
      `}</style>

      <nav className={`nb-root '} `}>
        <div className="nb-inner ">

          {/* Logo */}
          <a href="/" className="nb-logo">
            <Image
            className='md:w-[100] w-[80px] h-atuo'
              alt="TANTI"
              width={80}
              height={28}
              src="/Tanti_logo.png"
              style={{ objectFit: 'contain' }}
            />
          </a>

          {/* Right actions */}
          <div className="flex gap-2">



            {/* Bag */}
            <Link href="/bag" className="nb-btn">
              <span className="nb-btn-icon"><BsBag size={17} /></span>
              <span className="nb-btn-label">Bag</span>
              {user.cartCount > 0 && (
                <span className="nb-badge text-sm">{user.cartCount}</span>
              )}
            </Link>


            {/* Profile */}
            <div >
            {user?.isLoading ? (
              <Skeleton className="w-10 h-10 rounded-full" />
            ) : user?.isAuthenticated ? (
           <DropdownMenu>
      <DropdownMenuTrigger className="flex hover:bg-gray-100 items-center justify-center gap-0 cursor-pointer outline-0 h-10">
         {user.profilePicture?
          <Image src={user.profilePicture} width={30} height={30} className="rounded-full" alt="profile" />
        :<CgProfile size={30}/>}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Header */}
        <div className="px-3 py-2.5 flex items-center gap-2.5">
          {user?.profilePicture ? (
            <Image src={user.profilePicture} width={36} height={36} className="rounded-full" alt="profile" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <RiAccountCircle2Line className="text-blue-500" size={20} />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{user?.userName ?? "Guest"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email ?? "Not signed in"}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <>
          <DropdownMenuItem onClick={()=>{router.push("/profile")}} className="flex items-center gap-2.5 cursor-pointer">
            <UserCircle size={16} className="text-gray-400" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem onClick={()=>router.push("/orders")} className="flex items-center gap-2.5 cursor-pointer">
            <ShoppingBag size={16} className="text-gray-400" />
            Orders
          </DropdownMenuItem>

          {user?.role === "ADMIN" && (
            <DropdownMenuItem className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/admin')}>
              <ShieldCheck size={16} className="text-gray-400" />
              Admin panel
              <span className="ml-auto text-[11px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-medium">
                Admin
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem className="flex items-center gap-2.5 text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer" onClick={logout}>
            <LogOut size={16} />
            Log out
          </DropdownMenuItem>
        </>
      </DropdownMenuContent>
    </DropdownMenu>
            ) : (
              <Button onClick={()=>{router.push("/signin")}}>Sign In</Button>
            )}
            </div>

          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar