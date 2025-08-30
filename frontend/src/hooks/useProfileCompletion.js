import { useState, useEffect } from 'react';

const useProfileCompletion = (user) => {
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if essential profile fields are missing
      const hasEducation = user.education && user.education.length > 0;
      const hasSkills = user.skills && user.skills.length > 0;
      const hasCareerGoals = user.careerGoals && user.careerGoals.trim() !== '';
      const hasBio = user.bio && user.bio.trim() !== '';
      
      // Consider profile incomplete if missing 2 or more essential fields
      const completedFields = [hasEducation, hasSkills, hasCareerGoals, hasBio].filter(Boolean).length;
      setIsProfileIncomplete(completedFields < 2);
    }
  }, [user]);

  return isProfileIncomplete;
};

export default useProfileCompletion;
