module.exports = {
  TRANSPORT: {
    car_petrol: 0.20,      // kg CO2e per km
    car_diesel: 0.17,      // kg CO2e per km
    car_electric: 0.05,    // kg CO2e per km
    motorbike: 0.11,       // kg CO2e per km
    bus: 0.08,             // kg CO2e per km
    train: 0.04,           // kg CO2e per km
    flight: 0.25           // kg CO2e per km
  },
  ELECTRICITY: {
    grid: 0.82,            // kg CO2e per kWh
    renewable: 0.00        // kg CO2e per kWh
  },
  FOOD: {
    meat_heavy: 3.3,       // kg CO2e per day
    meat_average: 2.5,     // kg CO2e per day
    vegetarian: 1.7,       // kg CO2e per day
    vegan: 1.5             // kg CO2e per day
  },
  WASTE: {
    landfill: 0.80,        // kg CO2e per kg
    organic: 0.50,         // kg CO2e per kg
    recycled: 0.10         // kg CO2e per kg
  },
  // Conversion factors for habit reductions (carbon saved in kg CO2e per action/day)
  HABIT_SAVINGS: {
    walking: 0.20,         // kg CO2e saved per km walking instead of driving
    cycling: 0.20,         // kg CO2e saved per km cycling instead of driving
    public_transport: 0.12,// kg CO2e saved per km public transport instead of driving
    recycling: 0.50,       // kg CO2e saved per event/item recycled
    energy_saving: 0.82    // kg CO2e saved per hour of energy saving (approx 1 kWh)
  }
};
