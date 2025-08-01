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
      {/* Mobile Header */}
      <nav className="lg:hidden bg-golf-green text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Trophy className="text-golf-gold text-xl" />
              <span className="font-semibold text-lg">Oakwood Club</span>
            </div>
          </div>
        </div>
      </nav>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 text-white min-h-screen fixed left-0 top-0 z-40 bg-[#032617]">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-golf-gold rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-golf-green" />
            </div>
            <div>
              <h1 className="font-bold text-lg">PGC</h1>
              <p className="text-xs text-white/70">Private App</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <a className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* Admin Switch Button */}
          {isAdminView && (
            <div className="absolute bottom-20 left-6 right-6">
              <button
                onClick={onSwitchToAdmin}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-golf-gold/10 border border-golf-gold/20 text-golf-gold hover:bg-golf-gold/20 transition-all duration-200 group"
              >
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Back to Admin</span>
              </button>
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6">
            {/* Logout Menu - appears above profile when expanded */}
            <div className={`mb-2 transition-all duration-300 ease-in-out ${
              showLogoutMenu 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-4 pointer-events-none'
            }`}>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 border border-white/20">
                <button
                  onClick={() => {
                    setShowLogoutMenu(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg bg-red-500/10 border border-red-400/20 text-red-200 hover:bg-red-500/20 hover:border-red-400/40 transition-all duration-200 group"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">Log Out</span>
                </button>
              </div>
            </div>

            {/* Profile Section - clickable */}
            <button
              onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              className="w-full bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-all duration-200 border border-transparent hover:border-white/20"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-golf-gold rounded-full flex items-center justify-center">
                  <span className="text-golf-green font-bold text-sm">
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
                  <p className="text-xs text-white/70">Member</p>
                </div>
                <div className={`transition-transform duration-200 ${showLogoutMenu ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
