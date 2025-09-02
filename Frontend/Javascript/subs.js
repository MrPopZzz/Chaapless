document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const subscriptionPage = document.getElementById('subscription-page');
  const totalBillPage = document.getElementById('total-bill-page');
  const generalMealPlanBtn = document.getElementById('general-meal-plan');
  const premiumMealPlanBtn = document.getElementById('premium-meal-plan');
  const customMealPlanBtn = document.getElementById('custom-meal-plan');
  const generalMealOptions = document.getElementById('general-meal-options');
  const premiumMealOptions = document.getElementById('premium-meal-options');
  const customMealOptions = document.getElementById('custom-meal-options');
  const mealPlanOptionsDiv = document.querySelector('.meal-plan-options');
  const startDateInput = document.getElementById('start-date');
  const weekdayMeals = document.getElementById('weekday-meals');
  const mealSelectionContainer = document.getElementById('meal-selection-container');
  const numPersonsInput = document.getElementById('num-persons');
  const proceedBtn = document.getElementById('proceed-to-payment');
  const confirmBtn = document.getElementById('confirm-payment');
  const oneTimeBtn = document.getElementById('one-time-plan');
  const weeklyBtn = document.getElementById('weekly-plan');
  const monthlyBtn = document.getElementById('monthly-plan');

  // Price Constants
  const DAILY_RATES = {
    general: { veg: 70, paneer: 80, chicken: 93, mutton: 142, egg: 85, fish: 93 },
    premium: { veg: 100, paneer: 120, chicken: 140, mutton: 200, egg: 110, fish: 142 }
  };

  const WEEKLY_RATES = {
    general: { veg: 489, paneer: 559, chicken: 649, mutton: 999, egg: 589, fish: 649 },
    premium: { veg: 699, paneer: 839, chicken: 979, mutton: 1399, egg: 769, fish: 999 }
  };

  const FEES = {
    delivery: 140,
    packagingPerPerson: 38.50,
    freeDeliveryThreshold: 1500,
    gstRate: 0.12
  };

  // State
  let currentMealType = 'general';
  let currentSubscriptionType = '';
  let selectedPlanButton = null;

  function init() {
    subscriptionPage.classList.remove('hidden');
    totalBillPage.classList.add('hidden');
    generalMealOptions.classList.add('hidden');
    premiumMealOptions.classList.add('hidden');
    customMealOptions.classList.add('hidden');
    mealPlanOptionsDiv.classList.add('hidden');

    flatpickr(startDateInput, {
      dateFormat: 'Y-m-d',
      minDate: 'today',
      onChange: function(selectedDates) {
        generateMealSelections(selectedDates[0]);
        calculateTotal();
      }
    });

    setupEventListeners();
  }

  function setupEventListeners() {
    // Subscription type buttons
    oneTimeBtn.addEventListener('click', function() {
      currentSubscriptionType = 'one-time';
      resetUI();
      mealPlanOptionsDiv.classList.remove('hidden');
      customMealPlanBtn.classList.add('hidden');
    });

    weeklyBtn.addEventListener('click', function() {
      currentSubscriptionType = 'weekly';
      resetUI();
      mealPlanOptionsDiv.classList.remove('hidden');
      customMealPlanBtn.classList.remove('hidden');
    });

    monthlyBtn.addEventListener('click', function() {
      currentSubscriptionType = 'monthly';
      resetUI();
      mealPlanOptionsDiv.classList.remove('hidden');
      customMealPlanBtn.classList.remove('hidden');
      generalMealPlanBtn.classList.add('hidden');
      premiumMealPlanBtn.classList.add('hidden');
    });

    // Meal plan type buttons
    generalMealPlanBtn.addEventListener('click', function() {
      currentMealType = 'general';
      generalMealOptions.classList.remove('hidden');
      premiumMealOptions.classList.add('hidden');
      customMealOptions.classList.add('hidden');
    });   ////////////////  add number of person input

    premiumMealPlanBtn.addEventListener('click', function() {
      currentMealType = 'premium';
      premiumMealOptions.classList.remove('hidden');
      generalMealOptions.classList.add('hidden');
      customMealOptions.classList.add('hidden');
    });   ////////////////  add number of person input

    customMealPlanBtn.addEventListener('click', function() {
      currentMealType = currentMealType === 'premium' ? 'premium' : 'general';
      generalMealOptions.classList.add('hidden');
      premiumMealOptions.classList.add('hidden');
      customMealOptions.classList.remove('hidden');
      generateMealSelections(startDateInput._flatpickr.selectedDates[0] || new Date());
    });

    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('select-plan')) {
        e.preventDefault();
        document.querySelectorAll('.select-plan').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        selectedPlanButton = e.target;
        calculateTotal();
        showBillPage();
      }
    });

    mealSelectionContainer.addEventListener('change', function(e) {
      if (e.target.classList.contains('meal-select')) {
        calculateTotal();
      }
    });
    

    numPersonsInput.addEventListener('input', calculateTotal);
    proceedBtn.addEventListener('click', showBillPage);
    confirmBtn.addEventListener('click', confirmPayment);
  }

  function generateMealSelections(startDate) {
    mealSelectionContainer.innerHTML = '';
    
    // For weekly plans 7 days (one week), monthly plans 30 days (one month)
    const daysCount = currentSubscriptionType === 'monthly' ? 30 : 7;
    const days = [];
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      days.push({ day: dayName, date });
    }

    days.forEach((dayObj, i) => {
      const div = document.createElement('div');
      div.className = 'day-meal';

      const label = document.createElement('label');
      label.textContent = `${dayObj.day} (${dayObj.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`;

      const select = document.createElement('select');
      select.className = 'meal-select';
      select.dataset.day = dayObj.day.toLowerCase();
      select.innerHTML = getMealOptionsHTML();

      div.append(label, select);
      mealSelectionContainer.appendChild(div);
    });

    weekdayMeals.classList.remove('hidden');
    calculateTotal();
  }

  function getMealOptionsHTML() {
  // Always use daily rates for custom meal options
  const rates = DAILY_RATES[currentMealType];
  
  let options = '<option value="0">Skip this day</option>';
  options += `
    <option value="${rates.veg}">Veg Meal - ₹${rates.veg}/day</option>
    <option value="${rates.paneer}">Paneer Meal - ₹${rates.paneer}/day</option>
    <option value="${rates.chicken}">Chicken Meal - ₹${rates.chicken}/day</option>
    <option value="${rates.mutton}">Mutton Meal - ₹${rates.mutton}/day</option>
    <option value="${rates.egg}">Egg Meal - ₹${rates.egg}/day</option>
    <option value="${rates.fish}">Fish Meal - ₹${rates.fish}/day</option>
  `;
  
  return options;
}

  function calculateTotal() {
    const persons = parseInt(numPersonsInput.value) || 1;
    let subtotal = 0;

    // if (customMealOptions.classList.contains('hidden')) {
    //   if (selectedPlanButton && selectedPlanButton.dataset.plan) {
    //     subtotal = parseFloat(selectedPlanButton.dataset.plan);
    //   }
    // } else {
    //   const selects = document.querySelectorAll('.meal-select');
    //   let periodTotal = 0;
    //   selects.forEach(select => {
    //     periodTotal += parseFloat(select.value) || 0;
    //   });
      
    //   // For weekly plans, the rates are already weekly totals
    //   subtotal = periodTotal * persons;
    // }

    if (customMealOptions.classList.contains('hidden')) {
      if (selectedPlanButton) {
        // daily price for one-time, weekly price for weekly/monthly
        const price = currentSubscriptionType === 'one-time' ? 
                     selectedPlanButton.dataset.planDaily : 
                     selectedPlanButton.dataset.plan;
        subtotal = parseFloat(price) * persons;
      }
    } else {
      const selects = document.querySelectorAll('.meal-select');
      let periodTotal = 0;
      selects.forEach(select => {
        periodTotal += parseFloat(select.value) || 0;
      });
      subtotal = periodTotal * persons;
    }

    const deliveryFee = subtotal >= FEES.freeDeliveryThreshold ? 0 : FEES.delivery;
    const packagingFee = FEES.packagingPerPerson * persons;
    const gst = (subtotal + deliveryFee + packagingFee) * FEES.gstRate;
    const total = subtotal + deliveryFee + packagingFee + gst;

    updateCostDisplay(subtotal, gst, deliveryFee, packagingFee, total);
  }

  function updateCostDisplay(subtotal, gst, deliveryFee, packagingFee, total) {
    const format = (num) => isNaN(num) ? '0.00' : num.toFixed(2);
    document.getElementById('meal-cost').textContent = format(subtotal);
    document.getElementById('gst').textContent = format(gst);
    document.getElementById('delivery-fee').textContent = format(deliveryFee);
    document.getElementById('packaging-fee').textContent = format(packagingFee);
    document.getElementById('total-billed-amount').textContent = format(total);
    document.getElementById('free-delivery').classList.toggle('hidden', deliveryFee !== 0);
    document.getElementById('delivery-discount').classList.toggle('hidden', deliveryFee === 0);
  }

  function showBillPage() {
    document.getElementById('bill-meal-cost').textContent = document.getElementById('meal-cost').textContent;
    document.getElementById('bill-gst').textContent = document.getElementById('gst').textContent;
    document.getElementById('bill-delivery-fee').textContent = document.getElementById('delivery-fee').textContent;
    document.getElementById('bill-packaging-fee').textContent = document.getElementById('packaging-fee').textContent;
    document.getElementById('bill-total-amount').textContent = document.getElementById('total-billed-amount').textContent;

    subscriptionPage.classList.add('hidden');
    totalBillPage.classList.remove('hidden');
  }

  function confirmPayment() {
    alert('Payment confirmed! Thank you for choosing Chaapless.');
    init();
  }

  function resetUI() {
    generalMealOptions.classList.add('hidden');
    premiumMealOptions.classList.add('hidden');
    customMealOptions.classList.add('hidden');
    mealPlanOptionsDiv.classList.add('hidden');
    weekdayMeals.classList.add('hidden');
    mealSelectionContainer.innerHTML = '';
    selectedPlanButton = null;
    document.querySelectorAll('.select-plan').forEach(btn => btn.classList.remove('active'));
    updateCostDisplay(0, 0, 0, 0, 0);

    // Reset meal plan buttons visibility based on subscription type
    if (currentSubscriptionType === 'monthly') {
      generalMealPlanBtn.classList.add('hidden');
      premiumMealPlanBtn.classList.add('hidden');
    } else {
      generalMealPlanBtn.classList.remove('hidden');
      premiumMealPlanBtn.classList.remove('hidden');
    }
  }

  init();
});