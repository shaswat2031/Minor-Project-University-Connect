import React, { useEffect, useState } from 'react';
import ProfileReminderPopup from '../components/common/ProfileReminderPopup';
import useProfileCompletion from '../hooks/useProfileCompletion';

const Dashboard = ({ user }) => {
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const isProfileIncomplete = useProfileCompletion(user);

  useEffect(() => {
    // Show profile reminder if user lands on dashboard with incomplete profile
    // and hasn't dismissed it in this session
    const hasSeenReminder = sessionStorage.getItem('profileReminderShown');
    
    if (user && isProfileIncomplete && !hasSeenReminder) {
      setTimeout(() => {
        setShowProfileReminder(true);
        sessionStorage.setItem('profileReminderShown', 'true');
      }, 2000); // Show after 2 seconds
    }
  }, [user, isProfileIncomplete]);

  const handleCloseProfileReminder = () => {
    setShowProfileReminder(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ...existing dashboard JSX... */}
      
      <ProfileReminderPopup
        isOpen={showProfileReminder}
        onClose={handleCloseProfileReminder}
        user={user}
      />
    </div>
  );
};

export default Dashboard;