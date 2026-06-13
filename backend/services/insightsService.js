const https = require('https');
const dashboardService = require('./dashboardService');
const analyticsService = require('./analyticsService');
const logger = require('./cloudLogger');

/**
 * Static library containing recommendations mapped by impact category.
 * @type {Object.<string, Array.<Object>>}
 */
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

/**
 * Node-standard HTTPS POST helper.
 * @param {string} url 
 * @param {Object} headers 
 * @param {string} body 
 * @returns {Promise<Object>}
 */
const postRequest = (url, headers, body) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (e) => { reject(e); });
    req.write(body);
    req.end();
  });
};

/**
 * Generate localized roadmap based on primary emission source.
 */
const getLocalRoadmap = (primarySource) => {
  const roadmaps = {
    transport: {
      roadmap30: {
        title: "Active Commuting Habit",
        keyActions: [
          "Walk or bike for short trips under 3km",
          "Identify public transit alternatives for work commutes",
          "Track transport distances weekly in C.A.R.B.O.N+"
        ],
        expectedSavingDescription: "Saves up to 15-20% of transit emissions annually."
      },
      roadmap60: {
        title: "Public Transit Adoption",
        keyActions: [
          "Commit to taking bus or train at least 2 days a week",
          "Combine trips to reduce total vehicle mileage",
          "Encourage carpooling with colleagues or neighbors"
        ],
        expectedSavingDescription: "Reduces weekly transport footprint by up to 50%."
      },
      roadmap90: {
        title: "Low Carbon Commutes",
        keyActions: [
          "Explore hybrid/electric vehicle options for long-term switch",
          "Transition to a fully remote/flexible hybrid work schedule if possible",
          "Commit to one zero-emission travel day every single week"
        ],
        expectedSavingDescription: "Saves over 1.2 metric tons of CO2e per year."
      }
    },
    electricity: {
      roadmap30: {
        title: "Energy Audit & Phantom Loads",
        keyActions: [
          "Unplug idle electronics using smart power strips",
          "Replace top 5 high-use bulbs with energy-efficient LEDs",
          "Adjust AC settings to a constant 24°C (75°F)"
        ],
        expectedSavingDescription: "Shaves off 5-10% from your monthly electricity bill and footprint."
      },
      roadmap60: {
        title: "Efficient Appliances",
        keyActions: [
          "Optimize wash cycles (run full loads, wash on cold settings)",
          "Check and improve home insulation around windows and doors",
          "Set computers and entertainment centers to deep sleep modes"
        ],
        expectedSavingDescription: "Reduces electricity emissions by up to 25%."
      },
      roadmap90: {
        title: "Clean Energy Integration",
        keyActions: [
          "Investigate local community solar program subscriptions",
          "Begin planning for rooftop solar panel installations if feasible",
          "Implement solar-powered outdoor and accent lighting"
        ],
        expectedSavingDescription: "Offsets household electricity footprint by up to 80%."
      }
    },
    food: {
      roadmap30: {
        title: "Meat Reduction & Portion Control",
        keyActions: [
          "Introduce a strict Meatless Monday to your weekly routine",
          "Replace red meat consumption with poultry or fish",
          "Plan meals to avoid buying excess groceries"
        ],
        expectedSavingDescription: "Reduces dietary footprint by 15-20% instantly."
      },
      roadmap60: {
        title: "Plant-Based Dominance",
        keyActions: [
          "Ensure at least 50% of your weekly meals are fully vegetarian",
          "Source ingredients from local and seasonal farmers' markets",
          "Compost all unavoidable raw organic food scraps"
        ],
        expectedSavingDescription: "Lowers monthly food carbon footprint by up to 40%."
      },
      roadmap90: {
        title: "Zero-Waste Kitchen",
        keyActions: [
          "Adopt a fully plant-based vegan diet for a majority of your meals",
          "Eliminate single-use plastic packaging from your grocery purchases",
          "Grow your own kitchen herbs or small vegetables at home"
        ],
        expectedSavingDescription: "Saves up to 1.5 metric tons of CO2e annually per person."
      }
    },
    waste: {
      roadmap30: {
        title: "Rigorous Waste Segregation",
        keyActions: [
          "Install separate bins for recyclables, organics, and landfill",
          "Stop purchasing single-use plastic water bottles",
          "Wash containers before tossing them in recycling bins"
        ],
        expectedSavingDescription: "Reduces waste going to landfills by 30%."
      },
      roadmap60: {
        title: "Composting & Circular Use",
        keyActions: [
          "Start a backyard composter or subscribe to organic waste pick-ups",
          "Prefer purchasing products made from recycled materials",
          "Donate or resell gently used clothing, furniture, and tools"
        ],
        expectedSavingDescription: "Prevents high-potency methane emissions from food waste."
      },
      roadmap90: {
        title: "True Zero-Waste Lifestyle",
        keyActions: [
          "Adopt a zero-waste policy for all household purchases",
          "Repurpose or upcycle broken items instead of discarding them",
          "Support zero-waste bulk refilling stores in your local area"
        ],
        expectedSavingDescription: "Redirects over 90% of household waste away from landfills."
      }
    },
    general: {
      roadmap30: {
        title: "Awareness & Action Logging",
        keyActions: [
          "Log carbon footprint daily in C.A.R.B.O.N+",
          "Review weekly trends to understand emission spikes",
          "Share progress with one family member or friend"
        ],
        expectedSavingDescription: "Builds a baseline for sustainable behavioral modifications."
      },
      roadmap60: {
        title: "Consolidated Habit Tracking",
        keyActions: [
          "Log at least three green habits every single week",
          "Achieve a weekly Eco Score of at least 80",
          "Set a specific active carbon reduction goal"
        ],
        expectedSavingDescription: "Supports steady carbon savings of 10-15% across all categories."
      },
      roadmap90: {
        title: "Community Sustainability Leader",
        keyActions: [
          "Participate in local eco-challenges and cleanup campaigns",
          "Achieve a weekly Eco Score of at least 95",
          "Advocate for green workplace policies or energy initiatives"
        ],
        expectedSavingDescription: "Offsets carbon footprint and inspires social networks."
      }
    }
  };

  return roadmaps[primarySource] || roadmaps.general;
};

/**
 * Service to generate personalized action tips, roadmaps, and reports.
 */
const insightsService = {
  /**
   * Evaluate user activity history and build targeted suggestions.
   * @param {string} userId - Target user ID
   * @returns {Promise<Array.<Object>>}
   */
  async getInsights(userId) {
    const data = await dashboardService.getDashboardData(userId);
    const breakdown = data.weekly.breakdown;
    const total = data.weekly.total;

    const insights = [];

    if (total === 0) {
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

    const sortedCategories = Object.keys(breakdown).sort((a, b) => breakdown[b] - breakdown[a]);
    const primarySource = sortedCategories[0];

    if (INSIGHTS_LIBRARY[primarySource]) {
      insights.push(...INSIGHTS_LIBRARY[primarySource].slice(0, 2));
    }

    sortedCategories.slice(1).forEach(cat => {
      if (breakdown[cat] > 0 && INSIGHTS_LIBRARY[cat]) {
        insights.push(INSIGHTS_LIBRARY[cat][0]);
      }
    });

    if (insights.length < 3) {
      insights.push(INSIGHTS_LIBRARY.electricity[0]);
    }

    return insights;
  },

  /**
   * Generates a personalized 30/60/90-day improvement roadmap using Gemini.
   * Falls back to a local rule-based system if key is missing or call fails.
   * @param {string} userId 
   * @returns {Promise<Object>} Roadmap containing roadmap30, roadmap60, roadmap90
   */
  async getRoadmap(userId) {
    const data = await dashboardService.getDashboardData(userId);
    const breakdown = data.weekly.breakdown;
    const total = data.weekly.total;

    const sortedCategories = Object.keys(breakdown).sort((a, b) => breakdown[b] - breakdown[a]);
    const primarySource = total > 0 ? sortedCategories[0] : 'general';

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'xxxxxxxx') {
      logger.info(`Gemini API key not configured. Using high-quality local roadmap generator for primary category: ${primarySource}`);
      return getLocalRoadmap(primarySource);
    }

    try {
      logger.info(`Generating AI Carbon Reduction Roadmap for user ${userId} using Gemini API`);
      
      const prompt = `
        You are C.A.R.B.O.N+'s AI Eco-Advisor. Generate a personalized 30-Day, 60-Day, and 90-Day carbon reduction action plan based on these metrics:
        User Weekly Emissions Breakdown:
        - Transportation: ${breakdown.transport || 0} kg CO2e
        - Electricity: ${breakdown.electricity || 0} kg CO2e
        - Diet/Food: ${breakdown.food || 0} kg CO2e
        - Waste: ${breakdown.waste || 0} kg CO2e

        Respond with a clean JSON object containing exactly three keys: "roadmap30", "roadmap60", and "roadmap90".
        Each roadmap value MUST be an object with:
        1. "title" (string)
        2. "keyActions" (array of exactly 3 descriptive action items)
        3. "expectedSavingDescription" (string summarizing carbon savings)

        Your output must contain ONLY the valid raw JSON object. Do not include markdown code block characters like \`\`\`json.
      `;

      const requestBody = JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await postRequest(url, { 'Content-Type': 'application/json' }, requestBody);

      if (response.statusCode === 200) {
        const responseJson = JSON.parse(response.body);
        let textResult = responseJson.candidates[0].content.parts[0].text;
        
        // Clean up markdown markers if Gemini returned them
        textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const roadmap = JSON.parse(textResult);
        return roadmap;
      } else {
        throw new Error(`Gemini API returned status code ${response.statusCode}`);
      }
    } catch (error) {
      logger.error('Failed to generate AI roadmap with Gemini. Falling back to local generator.', error);
      return getLocalRoadmap(primarySource);
    }
  },

  /**
   * Generates a downloadable text report of user emissions and sustainability indicators.
   * @param {string} userId 
   * @returns {Promise<Object>} { reportText }
   */
  async getReport(userId) {
    const data = await dashboardService.getDashboardData(userId);
    const analytics = await analyticsService.getAnalytics(userId);
    const insights = await this.getInsights(userId);

    const reportText = `==================================================
C.A.R.B.O.N+ SUSTAINABILITY REPORT
User: ${userId}
Generated: ${new Date().toLocaleDateString()}
==================================================

1. EMISSION METRICS (WEEKLY SUMMARY)
----------------------------------
Total Weekly Footprint: ${analytics.weeklyStats.emissions} kg CO2e
Previous Week Footprint: ${analytics.weeklyStats.previousEmissions} kg CO2e
Change: ${analytics.improvementPercentage}% ${analytics.improvementPercentage < 0 ? 'Increase' : 'Reduction'}

Breakdown:
- Transportation: ${data.weekly.breakdown.transport} kg CO2e
- Electricity: ${data.weekly.breakdown.electricity} kg CO2e
- Food/Diet: ${data.weekly.breakdown.food} kg CO2e
- Waste Management: ${data.weekly.breakdown.waste} kg CO2e

2. GREEN HABITS & SAVINGS
-----------------------
Carbon Offset this week: ${analytics.weeklyStats.saved} kg CO2e
Eco-Score: ${analytics.ecoScore} / 100

3. GOALS PROGRESS
---------------
Total Goals: ${analytics.goals.total}
Completed Goals: ${analytics.goals.completed}
Active Goals: ${analytics.goals.active}
Goal Success Rate: ${analytics.goals.achievementRate}%

4. ECO-ADVISORY RECOMMENDATIONS
-----------------------------
${insights.map((ins, i) => `${i + 1}. [${ins.priority.toUpperCase()}] ${ins.title}
   ${ins.description}`).join('\n\n')}

==================================================
Small actions. Big environmental impact.
Thank you for using C.A.R.B.O.N+!
==================================================`;

    return { reportText };
  }
};

module.exports = insightsService;
