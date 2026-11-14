import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

export const ProtectedRoute: React.FC<{ allowedRole?: UserRole }> = ({ allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-creator-900 animate-pulse" />
          <span className="text-xs text-stone-500 font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Cross-role redirect per PRD §4
  if (allowedRole && role !== allowedRole) {
    const redirectPath = role === 'creator' ? '/creator/dashboard' : '/brand/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
