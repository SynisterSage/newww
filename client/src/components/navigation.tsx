import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Utensils, 
  Info,
  User,
  Trophy
} from "lucide-react";

interface NavigationProps {
  userEmail?: string;
}

export default function Navigation({ userEmail }: NavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tee-times", label: "Tee Times", icon: Calendar },
    { path: "/dining", label: "Dining", icon: Utensils },
    { path: "/conditions", label: "Course Conditions", icon: Info },
    { path: "/events", label: "Events & Tournaments", icon: Trophy },
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

          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-golf-gold rounded-full flex items-center justify-center">
                  <span className="text-golf-green font-bold text-sm">JD</span>
                </div>
                <div>
                  <h3 className="font-medium text-white">Lex Ferguson</h3>
                  <p className="text-xs text-white/70">Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
