import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Utensils, 
  Info
} from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tee-times", label: "Tee Times", icon: Calendar },
    { path: "/dining", label: "Dining", icon: Utensils },
    { path: "/course-conditions", label: "Conditions", icon: Info },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <a className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors ${
                isActive ? "text-golf-green" : "text-muted-foreground"
              }`}>
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? "bg-golf-green-soft" : "hover:bg-muted"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
