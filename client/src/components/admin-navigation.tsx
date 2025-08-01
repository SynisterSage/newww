import { useLocation } from "wouter";
import { Link } from "wouter";
import {
  Shield,
} from "lucide-react";

interface AdminNavigationProps {
  adminEmail?: string;
  onSwitchToMember?: () => void;
  onLogout?: () => void;
}

export default function AdminNavigation({ adminEmail, onSwitchToMember, onLogout }: AdminNavigationProps) {
  return (
    <>
      {/* Header Only */}
      <nav className="bg-slate-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="text-blue-400 text-xl" />
              <span className="font-semibold text-lg">PGC Admin</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}