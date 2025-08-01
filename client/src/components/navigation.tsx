import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Utensils, 
  MapPin, 
  User,
  Trophy
} from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tee-times", label: "Tee Times", icon: Calendar },
    { path: "/dining", label: "Dining", icon: Utensils },
    { path: "/gps", label: "Course GPS", icon: MapPin },
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
      <aside className="hidden lg:block w-64 bg-golf-green text-white min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Trophy className="text-golf-gold text-2xl" />
            <span className="font-bold text-xl">Oakwood Club</span>
          </div>
          
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-golf-green-light">
              <div className="w-16 h-16 bg-golf-gold rounded-full mx-auto mb-3 flex items-center justify-center">
                <User className="text-golf-green text-xl" />
              </div>
              <h3 className="font-semibold">John Wellington</h3>
              <p className="text-sm text-gray-300">Member #0847</p>
            </div>
            
            <nav className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-golf-green-light" 
                        : "hover:bg-golf-green-light"
                    }`}>
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
