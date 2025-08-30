import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, CheckCircle } from 'lucide-react';

const ProfileReminderPopup = ({ isOpen, onClose, user, onGoToProfile }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToProfile = () => {
    if (onGoToProfile) {
      onGoToProfile(); // Use parent's navigation handler
    } else {
      navigate('/my-profile', { replace: true }); // Use replace to prevent back navigation
    }
    onClose();
  };

  const handleSkipForNow = () => {
    onClose();
    navigate('/dashboard', { replace: true });
  };

  // Check profile completion status
  const checkProfileCompletion = (userData) => {
    if (!userData) return [];
    
    const completionStatus = [
      { field: 'Educational background', completed: userData.education && userData.education.length > 0 },
      { field: 'Skills and interests', completed: userData.skills && userData.skills.length > 0 },
      { field: 'Career goals', completed: userData.careerGoals && userData.careerGoals.trim() !== '' },
      { field: 'Profile picture', completed: userData.profilePicture && userData.profilePicture.trim() !== '' }
    ];
    
    return completionStatus;
  };

  const profileStatus = checkProfileCompletion(user);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <User className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Complete Your Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Welcome to University Connect, {user?.name || 'Student'}! 🎉
          </p>
          <p className="text-gray-600 mb-4">
            To get the most out of our platform, please complete your profile with:
          </p>
          <ul className="space-y-2 mb-4">
            {profileStatus.map((item, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <CheckCircle 
                  className={`w-4 h-4 mr-2 ${item.completed ? 'text-green-500' : 'text-gray-300'}`} 
                />
                {item.field}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">
            This will help us create personalized learning roadmaps and match you with relevant opportunities.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGoToProfile}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Complete Profile Now
          </button>
          <button
            onClick={handleSkipForNow}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Skip for Now
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          You can complete your profile anytime from the dashboard
        </p>
      </div>
    </div>
  );
};

export default ProfileReminderPopup;
