/**
 * Format time in seconds to MM:SS format
 * @param {number|null} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Get timer color class based on remaining time
 * @param {number|null} timeRemaining - Time remaining in seconds
 * @returns {string} Tailwind CSS color class
 */
export const getTimerColor = (timeRemaining) => {
  if (timeRemaining === null) return 'text-gray-300';
  if (timeRemaining <= 60) return 'text-red-500'; // Last minute - red
  if (timeRemaining <= 300) return 'text-yellow-500'; // Last 5 mins - yellow
  return 'text-green-500'; // More than 5 mins - green
};

/**
 * Get progress indicator color and status
 * @param {number} index - Question index
 * @param {number} currentIndex - Current question index
 * @param {Array} completedProblems - Array of completed problem indices
 * @param {Array} skippedProblems - Array of skipped problem indices
 * @returns {Object} Object containing color class and status text
 */
export const getProgressStatus = (index, currentIndex, completedProblems, skippedProblems) => {
  if (completedProblems.includes(index)) {
    return {
      colorClass: 'bg-green-500',
      status: 'Completed'
    };
  }
  if (skippedProblems.includes(index)) {
    return {
      colorClass: 'bg-yellow-500',
      status: 'Skipped'
    };
  }
  if (index === currentIndex) {
    return {
      colorClass: 'bg-blue-500',
      status: 'Current'
    };
  }
  return {
    colorClass: 'bg-gray-600',
    status: 'Pending'
  };
};
