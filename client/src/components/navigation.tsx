import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  Home, 
  Calendar, 
  Utensils, 
  Info,
  User,
  Trophy,
  Shield,
  LogOut
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface NavigationProps {
  userEmail?: string;
  userData?: UserType | null;
  isAdminView?: boolean;
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
}

export default function Navigation({ userEmail, userData, isAdminView, onSwitchToAdmin, onLogout }: NavigationProps) {
  const [location] = useLocation();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tee-times", label: "Tee Times", icon: Calendar },
    { path: "/dining", label: "Dining", icon: Utensils },
    { path: "/conditions", label: "Course Conditions", icon: Info },
    { path: "/events", label: "Events", icon: Trophy },
  ];

  return (
    <>
      {/* Mobile/Tablet Header */}
      <nav className="lg:hidden bg-golf-green text-white shadow-lg sticky top-0 z-50 border-b border-golf-green/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Trophy className="text-golf-gold text-xl" />
              <span className="font-semibold text-lg">Oakwood Club</span>
            </div>
          </div>
        </div>
      </nav>
      {/* Desktop Sidebar - Only show on desktop screens */}
      <aside className="hidden lg:block w-64 text-white min-h-screen fixed left-0 top-0 z-40 bg-[#032617]">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-white/10">
            <div className="w-8 h-8 bg-golf-gold rounded-md flex items-center justify-center">
              <Trophy className="w-5 h-5 text-golf-green" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">PGC</h1>
              <p className="text-xs text-white/60">Member Portal</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer no-underline ${
                    isActive 
                      ? "bg-white/15 text-white border-l-3 border-golf-gold ml-0 pl-3" 
                      : "text-white/70 hover:bg-white/8 hover:text-white hover:pl-5"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin Switch Button */}
          {isAdminView && (
            <div className="absolute bottom-20 left-6 right-6">
              <button
                onClick={onSwitchToAdmin}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md bg-golf-gold/15 border border-golf-gold/30 text-golf-gold hover:bg-golf-gold/25 hover:border-golf-gold/40 transition-all duration-200 text-sm font-medium"
              >
                <Shield className="w-4 h-4" />
                <span>Back to Admin</span>
              </button>
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6">
            {/* Logout Menu - appears above profile when expanded */}
            <div className={`mb-3 transition-all duration-300 ease-in-out ${
              showLogoutMenu 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-4 pointer-events-none'
            }`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <button
                  onClick={() => {
                    setShowLogoutMenu(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-md bg-red-500/15 border border-red-400/30 text-red-200 hover:bg-red-500/25 hover:border-red-400/40 transition-all duration-200 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* Profile Section - clickable */}
            <button
              onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              className="w-full bg-white/8 rounded-lg p-4 hover:bg-white/12 transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-golf-gold rounded-md flex items-center justify-center">
                  <span className="text-golf-green font-semibold text-sm">
                    {userData?.firstName && userData?.lastName 
                      ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase()
                      : userEmail ? userEmail.substring(0, 2).toUpperCase() 
                      : "JD"}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-medium text-white text-sm truncate">
                    {userData?.firstName && userData?.lastName 
                      ? `${userData.firstName} ${userData.lastName}`
                      : userEmail || "Member"}
                  </h3>
                  <p className="text-xs text-white/60">Golf Member</p>
                </div>
                <div className={`transition-transform duration-200 ${showLogoutMenu ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
