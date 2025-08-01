import { useLocation } from "wouter";
import { useState } from "react";
import { Link } from "wouter";
import {
  Trophy,
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
  return (
    <>
      {/* Mobile Header Only */}
      <nav className="bg-golf-green text-white shadow-lg sticky top-0 z-50 border-b border-golf-green/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Trophy className="text-golf-gold text-xl" />
              <span className="font-semibold text-lg">Packanack Golf Club</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}