'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { BiBell } from 'react-icons/bi'
import { FiUser, FiLogOut } from 'react-icons/fi'
import { IoIosMore } from "react-icons/io";
import { FaUserCircle } from 'react-icons/fa'
import { withAuth } from '@/middlewares/withAuth'
import { useAuth } from '@/contexts/AuthContext';
import { GET_MY_NOTIFICATIONS } from '@/api/queries/notifications';


const ProfileButtons = ({ userData }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()
  const { logout: authLogout } = useAuth();

  // Live unread count — only polls when the browser tab is visible
  const { data: notifData, refetch: refetchNotifs } = useQuery(GET_MY_NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
  });
  const hasNotifications = (notifData?.notifications || []).some((n) => !n.isRead);

  useEffect(() => {
    // Re-fetch when the user returns to this tab (visibility API)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refetchNotifs();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refetchNotifs]);

  // Function to navigate to notifications
  const navigateToNotifications = () => {
    const timestamp = Date.now(); 
    const basePath = `/dashboard/${userData?.id}`;
  
    router.push(`${basePath}?tab=notifications&_=${timestamp}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await authLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    { icon: <FiUser className="w-5 h-5" />, label: 'My Profile', action: () => router.push(`/dashboard/${userData?.id}`) },
    { icon: <FiLogOut className="w-5 h-5" />, label: 'Logout', action: handleLogout }, 
  ]

  return (
    <div className="flex items-center gap-4">
      {/* Notification Icon */}
      <button
        className="relative text-gray-600 hover:text-gray-800 transition-colors"
        style={{ padding: '10px'}}
        onClick={navigateToNotifications} // Navigate to notifications
      >
        <BiBell className="w-6 h-6" />
        {hasNotifications && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex items-center focus:outline-none"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <FaUserCircle className="text-white w-6 h-6" />
          </div>
        </button>

        {/* Enhanced Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-xl z-[100] border border-gray-200 p-3" style={{ transform: 'translateY(0)', visibility: 'visible' }}>
            {/* User Profile Section */}
            <div className="border-b border-gray-200 bg-white" style={{ paddingTop: '10px', paddingBottom: '10px'}}>
              <div className="flex items-center space-x-3">
                <div>
                  <h4 className="text-base font-semibold text-gray-800">{userData?.firstName || "User"}</h4>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  style={{ padding: '10px'}}
                  className="w-full text-left text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center space-x-3 group"
                >
                  <span className="rounded-lg bg-gray-50 text-gray-600 group-hover:bg-gray-100 group-hover:text-blue-600 group-active:bg-gray-200 transition-colors p-1">  
                    {item.icon}
                  </span>
                  <span className="text-gray-700 group-hover:text-gray-900 group-active:text-gray-900 font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default (withAuth(ProfileButtons));