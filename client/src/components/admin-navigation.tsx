import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  UtensilsCrossed, 
  Users,
  Trophy,
  Settings,
  Shield
} from "lucide-react";

interface AdminNavigationProps {
  adminEmail?: string;
}

export default function AdminNavigation({ adminEmail }: AdminNavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/tee-times", label: "Tee Times", icon: Calendar },
    { path: "/admin/orders", label: "Orders", icon: UtensilsCrossed },
    { path: "/admin/members", label: "Members", icon: Users },
    { path: "/admin/events", label: "Events", icon: Trophy },
  ];

  return (
    <>
      {/* Mobile Header */}
      <nav className="lg:hidden bg-slate-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="text-blue-400 text-xl" />
              <span className="font-semibold text-lg">PGC Admin</span>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 text-white min-h-screen fixed left-0 top-0 z-40 bg-slate-800">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">PGC Admin</h1>
              <p className="text-xs text-white/70">Staff Portal</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {adminEmail ? adminEmail.substring(0, 2).toUpperCase() : "AD"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">{adminEmail || "Admin"}</h3>
                  <p className="text-xs text-white/70">Staff Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}