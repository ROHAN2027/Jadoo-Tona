  const handleInterviewComplete = (data) => {
    try {
      console.log('Starting interview completion...', { questionNumber, concentrationReadings });

      // Calculate scores for all questions
      const questionScores = {};
      let totalScore = 0;
      let questionCount = 0;

      // Process all concentration readings
      Object.entries(concentrationReadings).forEach(([qNum, readings]) => {
        if (readings && readings.length > 0) {
          const sum = readings.reduce((a, b) => a + b, 0);
          const avg = sum / readings.length;
          questionScores[qNum] = avg;
          totalScore += avg;
          questionCount++;
          console.log(`Question ${qNum} average:`, avg, 'from', readings.length, 'readings');
        }
      });

      // Calculate overall average
      const overallAverage = questionCount > 0 ? totalScore / questionCount : 0;
      console.log('Concentration calculation:', {
        totalScore,
        questionCount,
        overallAverage
      });

      // Set the final average for display
      setFinalAverageConcentration(overallAverage);

      // Prepare enhanced data with concentration scores
      const enhancedData = {
        ...data,
        concentrationScore: {
          score: overallAverage,
          scorePercentage: (overallAverage * 100).toFixed(2),
          questionScores: Object.fromEntries(
            Object.entries(questionScores).map(([qNum, score]) => [
              qNum,
              (score * 100).toFixed(2)
            ])
          )
        }
      };

      console.log('Interview complete with data:', enhancedData);
      
      // Call the completion handler
      if (onComplete) {
        onComplete(enhancedData);
      }
    } catch (error) {
      console.error('Error in handleInterviewComplete:', error);
      // Still try to complete the interview even if concentration calculation fails
      if (onComplete) {
        onComplete(data);
      }
    }
  };