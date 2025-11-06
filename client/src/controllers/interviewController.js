/**
 * Interview state management controller
 * Handles question navigation and completion tracking
 */

/**
 * Handle skip action
 * @param {number} currentIndex - Current problem index
 * @param {Array} skippedProblems - Array of skipped problem indices
 * @param {Function} setSkippedProblems - State setter for skipped problems
 * @param {Function} moveToNext - Function to move to next question
 */
export const handleSkipQuestion = (
  currentIndex, 
  skippedProblems, 
  setSkippedProblems, 
  moveToNext
) => {
  setSkippedProblems([...skippedProblems, currentIndex]);
  moveToNext();
};

/**
 * Handle submit action
 * @param {number} currentIndex - Current problem index
 * @param {Array} completedProblems - Array of completed problem indices
 * @param {Function} setCompletedProblems - State setter for completed problems
 * @param {Function} moveToNext - Function to move to next question
 */
export const handleSubmitQuestion = (
  currentIndex, 
  completedProblems, 
  setCompletedProblems, 
  moveToNext
) => {
  setCompletedProblems([...completedProblems, currentIndex]);
  moveToNext();
};

/**
 * Handle auto-submit when timer expires
 * @param {number} currentIndex - Current problem index
 * @param {Array} completedProblems - Array of completed problem indices
 * @param {Function} setCompletedProblems - State setter for completed problems
 * @param {Function} moveToNext - Function to move to next question
 */
export const handleAutoSubmitQuestion = (
  currentIndex, 
  completedProblems, 
  setCompletedProblems, 
  moveToNext
) => {
  // TODO: Send to backend API with time_expired flag
  setCompletedProblems([...completedProblems, currentIndex]);
  moveToNext();
};

/**
 * Move to next question or complete interview
 * @param {number} currentIndex - Current problem index
 * @param {number} totalQuestions - Total number of questions
 * @param {Function} setCurrentIndex - State setter for current index
 * @param {Function} setInterviewComplete - State setter for interview completion
 */
export const moveToNextQuestion = (
  currentIndex, 
  totalQuestions, 
  setCurrentIndex, 
  setInterviewComplete
) => {
  if (currentIndex < totalQuestions - 1) {
    setCurrentIndex(currentIndex + 1);
  } else {
    // Interview complete
    setInterviewComplete(true);
  }
};
