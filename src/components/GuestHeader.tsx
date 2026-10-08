import type React from 'react';
import { LandingNavbar, type NavItem } from './landing/LandingNavbar';

export type { NavItem };

interface GuestHeaderProps {
  navItems?: NavItem[];
}

const GuestHeader: React.FC<GuestHeaderProps> = ({ navItems }) => {
  return <LandingNavbar navItems={navItems} />;
};

export default GuestHeader;
