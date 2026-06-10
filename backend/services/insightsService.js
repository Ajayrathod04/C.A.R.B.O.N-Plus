const dashboardService = require('./dashboardService');

const INSIGHTS_LIBRARY = {
  transport: [
    {
      id: 't1',
      category: 'transport',
      title: 'Shift to Active Commuting',
      description: 'Replace short car trips with walking or cycling. You save around 0.2 kg of CO2e for every kilometer you walk or bike.',
      priority: 'high'
    },
    {
      id: 't2',
      category: 'transport',
      title: 'Use Public Transit',
      description: 'Switching to buses or trains reduces transportation emissions by up to 60% compared to single-passenger car travel.',
      priority: 'medium'
    },
    {
      id: 't3',
      category: 'transport',
      title: 'Practice Eco-Driving',
      description: 'Avoid rapid acceleration and braking. Proper tire inflation and sensible speeds can improve fuel economy by 10-30%.',
      priority: 'low'
    }
  ],
  electricity: [
    {
      id: 'e1',
      category: 'electricity',
      title: 'Eliminate Standby Power',
      description: 'Unplug devices when not in use. Idle electronics account for up to 10% of household electricity consumption.',
      priority: 'medium'
    },
    {
      id: 'e2',
      category: 'electricity',
      title: 'Switch to LED Bulbs',
      description: 'LEDs use 75-80% less energy than incandescent bulbs and last up to 25 times longer.',
      priority: 'high'
    },
    {
      id: 'e3',
      category: 'electricity',
      title: 'Optimize Air Conditioning',
      description: 'Set your AC to 24°C (75°F). Every degree warmer can save up to 6% on cooling costs.',
      priority: 'medium'
    }
  ],
  food: [
    {
      id: 'f1',
      category: 'food',
      title: 'Adopt a Meatless Monday',
      description: 'Swapping meat for plant-based alternatives just one day a week reduces your daily food emissions by up to 30%.',
      priority: 'high'
    },
    {
      id: 'f2',
      category: 'food',
      title: 'Reduce Food Waste',
      description: 'Plan meals in advance, store food correctly, and compost leftovers. Food waste in landfills produces highly potent methane gas.',
      priority: 'high'
    }
  ],
  waste: [
    {
      id: 'w1',
      category: 'waste',
      title: 'Compost Organic Waste',
      description: 'Diverting organic waste from landfills reduces methane emissions and produces nutrient-rich soil helper.',
      priority: 'medium'
    },
    {
      id: 'w2',
      category: 'waste',
      title: 'Practice Rigorous Recycling',
      description: 'Separate plastics, paper, and glass. Recycled items use significantly less energy to process than virgin materials.',
      priority: 'high'
    }
  ]
};

const insightsService = {
  async getInsights(userId) {
    const data = await dashboardService.getDashboardData(userId);
    const breakdown = data.weekly.breakdown;
    const total = data.weekly.total;

    const insights = [];

    if (total === 0) {
      // Return default onboarding recommendations
      return [
        {
          id: 'gen1',
          category: 'general',
          title: 'Welcome to C.A.R.B.O.N+!',
          description: 'Log your first daily footprint using the Carbon Footprint Calculator to receive personalized insights.',
          priority: 'high'
        },
        INSIGHTS_LIBRARY.food[0],
        INSIGHTS_LIBRARY.electricity[1]
      ];
    }

    // Determine primary emission source
    const sortedCategories = Object.keys(breakdown).sort((a, b) => breakdown[b] - breakdown[a]);
    const primarySource = sortedCategories[0];

    // Add high priority recommendation for the primary source
    if (INSIGHTS_LIBRARY[primarySource]) {
      insights.push(...INSIGHTS_LIBRARY[primarySource].slice(0, 2));
    }

    // Add other relevant recommendations
    sortedCategories.slice(1).forEach(cat => {
      if (breakdown[cat] > 0 && INSIGHTS_LIBRARY[cat]) {
        insights.push(INSIGHTS_LIBRARY[cat][0]);
      }
    });

    // Fallback if list is too short
    if (insights.length < 3) {
      insights.push(INSIGHTS_LIBRARY.electricity[0]);
    }

    return insights;
  }
};

module.exports = insightsService;
