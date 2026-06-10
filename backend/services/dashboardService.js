const { calculatorService } = require('./calculatorService');

const dashboardService = {
  async getDashboardData(userId) {
    const logs = await calculatorService.getLogs(userId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helper for date subtraction
    const getPastDateStr = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const oneWeekAgoStr = getPastDateStr(7);
    const oneMonthAgoStr = getPastDateStr(30);
    const oneYearAgoStr = getPastDateStr(365);

    let dailyFootprint = 0;
    let weeklyFootprint = 0;
    let monthlyFootprint = 0;
    let yearlyFootprint = 0;

    let dailyBreakdown = { transport: 0, electricity: 0, food: 0, waste: 0 };
    let weeklyBreakdown = { transport: 0, electricity: 0, food: 0, waste: 0 };
    let monthlyBreakdown = { transport: 0, electricity: 0, food: 0, waste: 0 };
    let yearlyBreakdown = { transport: 0, electricity: 0, food: 0, waste: 0 };

    logs.forEach(log => {
      const logDate = log.date; // Format 'YYYY-MM-DD'
      
      // Daily (exact match with today)
      if (logDate === todayStr) {
        dailyFootprint += log.total;
        dailyBreakdown.transport += log.breakdown.transport;
        dailyBreakdown.electricity += log.breakdown.electricity;
        dailyBreakdown.food += log.breakdown.food;
        dailyBreakdown.waste += log.breakdown.waste;
      }

      // Weekly (past 7 days)
      if (logDate >= oneWeekAgoStr && logDate <= todayStr) {
        weeklyFootprint += log.total;
        weeklyBreakdown.transport += log.breakdown.transport;
        weeklyBreakdown.electricity += log.breakdown.electricity;
        weeklyBreakdown.food += log.breakdown.food;
        weeklyBreakdown.waste += log.breakdown.waste;
      }

      // Monthly (past 30 days)
      if (logDate >= oneMonthAgoStr && logDate <= todayStr) {
        monthlyFootprint += log.total;
        monthlyBreakdown.transport += log.breakdown.transport;
        monthlyBreakdown.electricity += log.breakdown.electricity;
        monthlyBreakdown.food += log.breakdown.food;
        monthlyBreakdown.waste += log.breakdown.waste;
      }

      // Yearly (past 365 days)
      if (logDate >= oneYearAgoStr && logDate <= todayStr) {
        yearlyFootprint += log.total;
        yearlyBreakdown.transport += log.breakdown.transport;
        yearlyBreakdown.electricity += log.breakdown.electricity;
        yearlyBreakdown.food += log.breakdown.food;
        yearlyBreakdown.waste += log.breakdown.waste;
      }
    });

    // Format outputs to 2 decimal places
    const formatBreakdown = (b) => ({
      transport: parseFloat(b.transport.toFixed(2)),
      electricity: parseFloat(b.electricity.toFixed(2)),
      food: parseFloat(b.food.toFixed(2)),
      waste: parseFloat(b.waste.toFixed(2))
    });

    return {
      daily: { total: parseFloat(dailyFootprint.toFixed(2)), breakdown: formatBreakdown(dailyBreakdown) },
      weekly: { total: parseFloat(weeklyFootprint.toFixed(2)), breakdown: formatBreakdown(weeklyBreakdown) },
      monthly: { total: parseFloat(monthlyFootprint.toFixed(2)), breakdown: formatBreakdown(monthlyBreakdown) },
      yearly: { total: parseFloat(yearlyFootprint.toFixed(2)), breakdown: formatBreakdown(yearlyBreakdown) },
      recentLogs: logs.slice(0, 10) // Return 10 most recent logs
    };
  }
};

module.exports = dashboardService;
