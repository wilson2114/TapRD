import React from 'react';
import { Navbar } from './Navbar';

export interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenContact: (productInterest?: string) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

/**
 * Header Component - Main responsive navigation bar for TapRD.
 * Wraps Navbar with responsive mobile menu and auth actions.
 */
export function Header(props: HeaderProps) {
  return <Navbar {...props} />;
}
