const { calculatorService } = require('./calculatorService');
const habitService = require('./habitService');
const goalService = require('./goalService');

const analyticsService = {
  async getAnalytics(userId) {
    const emissionLogs = await calculatorService.getLogs(userId);
    const habitLogs = await habitService.getHabits(userId);
    const goals = await goalService.getGoals(userId);

    const now = new Date();
    
    // Helper to get past dates
    const getPastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgoStr = getPastDate(7).toISOString().split('T')[0];
    const fourteenDaysAgoStr = getPastDate(14).toISOString().split('T')[0];

    // 1. Calculate this week's vs last week's emissions
    let thisWeekEmissions = 0;
    let lastWeekEmissions = 0;

    emissionLogs.forEach(log => {
      if (log.date >= sevenDaysAgoStr && log.date <= todayStr) {
        thisWeekEmissions += log.total;
      } else if (log.date >= fourteenDaysAgoStr && log.date < sevenDaysAgoStr) {
        lastWeekEmissions += log.total;
      }
    });

    // 2. Calculate carbon saved from habits this week
    let weeklyHabitSavings = 0;
    habitLogs.forEach(log => {
      if (log.date >= sevenDaysAgoStr && log.date <= todayStr) {
        weeklyHabitSavings += log.carbonSaved;
      }
    });

    // 3. Goals stats
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;

    // 4. Calculate Eco Score (0 to 100)
    // Sustainable target: 5 kg CO2e per day (approx 35 kg per week)
    // Average baseline: 15 kg CO2e per day (approx 105 kg per week)
    const averageWeeklyEmission = thisWeekEmissions;
    const baseScore = 70; // start neutral
    
    // Penalty: If emissions are high, reduce score. If low, increase.
    let emissionAdjustment = 0;
    if (averageWeeklyEmission > 0) {
      if (averageWeeklyEmission <= 35) {
        emissionAdjustment = 20; // Excellent
      } else if (averageWeeklyEmission <= 70) {
        emissionAdjustment = 10;  // Good
      } else if (averageWeeklyEmission <= 105) {
        emissionAdjustment = 0;   // Average
      } else {
        emissionAdjustment = -Math.min(40, (averageWeeklyEmission - 105) * 0.4); // High emissions penalty
      }
    }

    // Bonuses
    const habitBonus = Math.min(20, weeklyHabitSavings * 4); // 4 points per kg CO2e saved, max 20
    const goalBonus = Math.min(10, completedGoals * 5); // 5 points per completed goal, max 10

    const ecoScore = Math.max(0, Math.min(100, Math.round(baseScore + emissionAdjustment + habitBonus + goalBonus)));

    // 5. Compute weekly trend by day (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = getPastDate(i).toISOString().split('T')[0];
      const dayLogs = emissionLogs.filter(log => log.date === dateStr);
      const dayTotal = dayLogs.reduce((sum, log) => sum + log.total, 0);
      
      const dayHabits = habitLogs.filter(log => log.date === dateStr);
      const daySaved = dayHabits.reduce((sum, log) => sum + log.carbonSaved, 0);

      dailyTrend.push({
        date: dateStr,
        emissions: parseFloat(dayTotal.toFixed(2)),
        saved: parseFloat(daySaved.toFixed(2))
      });
    }

    // 6. Behavioral Improvements
    // Calculate percentage of logs where transport was non-carbon or eco-friendly
    const totalLogsCount = emissionLogs.length;
    const ecoTransportCount = emissionLogs.filter(log => 
      ['car_electric', 'bus', 'train'].includes(log.transportType) || log.transportDistance === 0
    ).length;

    const ecoTransportRatio = totalLogsCount > 0 ? (ecoTransportCount / totalLogsCount) * 100 : 0;

    // 7. Improvement trend
    let improvementPercentage = 0;
    if (lastWeekEmissions > 0) {
      improvementPercentage = ((lastWeekEmissions - thisWeekEmissions) / lastWeekEmissions) * 100;
    } else if (thisWeekEmissions > 0) {
      improvementPercentage = 0; // No baseline
    } else {
      improvementPercentage = 0;
    }

    return {
      ecoScore,
      improvementPercentage: parseFloat(improvementPercentage.toFixed(1)),
      weeklyStats: {
        emissions: parseFloat(thisWeekEmissions.toFixed(2)),
        saved: parseFloat(weeklyHabitSavings.toFixed(2)),
        previousEmissions: parseFloat(lastWeekEmissions.toFixed(2))
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        active: activeGoals,
        achievementRate: totalGoals > 0 ? parseFloat(((completedGoals / totalGoals) * 100).toFixed(1)) : 0
      },
      behavioral: {
        ecoFriendlyCommutePercentage: parseFloat(ecoTransportRatio.toFixed(1))
      },
      dailyTrend
    };
  }
};

module.exports = analyticsService;
