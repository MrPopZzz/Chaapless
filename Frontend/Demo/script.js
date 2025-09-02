// DOM Elements
const registrationPage = document.getElementById('registration-page');
const subscriptionPage = document.getElementById('subscription-page');
const totalBillPage = document.getElementById('total-bill-page');
const registrationForm = document.getElementById('registration-form');
const generalMealPlanBtn = document.getElementById('general-meal-plan');
const premiumMealPlanBtn = document.getElementById('premium-meal-plan');
const generalMealOptions = document.getElementById('general-meal-options');
const premiumMealOptions = document.getElementById('premium-meal-options');
const customMealOptions = document.getElementById('custom-meal-options');
const startDateInput = document.getElementById('start-date');
const weekdayMeals = document.getElementById('weekday-meals');
const mealSelectionContainer = document.getElementById('meal-selection-container');
const numPersonsInput = document.getElementById('num-persons');
const mealCostDisplay = document.getElementById('meal-cost');
const gstDisplay = document.getElementById('gst');
const deliveryFeeDisplay = document.getElementById('delivery-fee');
const packagingFeeDisplay = document.getElementById('packaging-fee');
const totalBilledAmountDisplay = document.getElementById('total-billed-amount');
const proceedToPaymentButton = document.getElementById('proceed-to-payment');
const freeDeliveryMessage = document.getElementById('free-delivery');
const deliveryDiscount = document.getElementById('delivery-discount');
const billMealCost = document.getElementById('bill-meal-cost');
const billGst = document.getElementById('bill-gst');
const billDeliveryFee = document.getElementById('bill-delivery-fee');
const billPackagingFee = document.getElementById('bill-packaging-fee');
const billTotalAmount = document.getElementById('bill-total-amount');
const confirmPaymentButton = document.getElementById('confirm-payment');

// Variables
let totalCost = 0;
let currentMealPlan = 'general'; // 'general' or 'premium'
let isFreeDelivery = true; // Set to true to enable free delivery
const packagingFee = 38.50; // Packaging & Handling Charges

// Initialize Flatpickr Calendar
flatpickr(startDateInput, {
  dateFormat: 'Y-m-d',
  minDate: 'today',
  onChange: function (selectedDates) {
    const selectedDate = selectedDates[0];
    const now = new Date();
    const cutoffTime = new Date();
    cutoffTime.setHours(18, 0, 0, 0); // 6:00 PM cutoff

    if (selectedDate.toDateString() === now.toDateString()) {
      if (now > cutoffTime) {
        // If selected after 6:00 PM, start from the day after tomorrow
        startDateInput._flatpickr.setDate(new Date(now.setDate(now.getDate() + 2)));
      } else {
        // If selected before 6:00 PM, start from the next day
        startDateInput._flatpickr.setDate(new Date(now.setDate(now.getDate() + 1)));
      }
    }

    generateWeekdayMeals(selectedDate);
    updateTotalCost();
  },
});

// Event Listeners
registrationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  registrationPage.classList.add('hidden');
  subscriptionPage.classList.remove('hidden');
});

generalMealPlanBtn.addEventListener('click', () => {
  currentMealPlan = 'general';
  generalMealOptions.classList.remove('hidden');
  premiumMealOptions.classList.add('hidden');
  customMealOptions.classList.add('hidden');
});

premiumMealPlanBtn.addEventListener('click', () => {
  currentMealPlan = 'premium';
  premiumMealOptions.classList.remove('hidden');
  generalMealOptions.classList.add('hidden');
  customMealOptions.classList.add('hidden');
});

document.querySelectorAll('.select-plan').forEach((button) => {
  button.addEventListener('click', (e) => {
    if (e.target.dataset.plan === 'custom') {
      customMealOptions.classList.remove('hidden');
      generateWeekdayMeals(new Date()); // Generate meals for the current date
    } else {
      customMealOptions.classList.add('hidden');
      totalCost = parseInt(e.target.dataset.plan) * parseInt(numPersonsInput.value);
      updateTotalCost();
      showTotalBill();
    }
  });
});

numPersonsInput.addEventListener('input', updateTotalCost);

proceedToPaymentButton.addEventListener('click', () => {
  showTotalBill();
});

confirmPaymentButton.addEventListener('click', () => {
  alert('Payment confirmed! Thank you for choosing Chaapless.');
});

// Functions
function generateWeekdayMeals(startDate) {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  mealSelectionContainer.innerHTML = ''; // Clear previous content

  weekdays.forEach((day, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);

    const dayMeal = document.createElement('div');
    dayMeal.className = 'day-meal';

    const dayLabel = document.createElement('label');
    dayLabel.textContent = `${day} (${date.toDateString()}):`;
    dayMeal.appendChild(dayLabel);

    const mealSelect = document.createElement('select');
    mealSelect.innerHTML = `
      <option value="${currentMealPlan === 'general' ? 70 : 100}">Veg Meal - ₹${currentMealPlan === 'general' ? 70 : 100}/day</option>
      <option value="${currentMealPlan === 'general' ? 80 : 120}">Paneer Meal - ₹${currentMealPlan === 'general' ? 80 : 120}/day</option>
      <option value="${currentMealPlan === 'general' ? 93 : 140}">Chicken Meal - ₹${currentMealPlan === 'general' ? 93 : 140}/day</option>
      <option value="${currentMealPlan === 'general' ? 142 : 200}">Mutton Meal - ₹${currentMealPlan === 'general' ? 142 : 200}/day</option>
      <option value="${currentMealPlan === 'general' ? 85 : 110}">Egg Meal - ₹${currentMealPlan === 'general' ? 85 : 110}/day</option>
      <option value="${currentMealPlan === 'general' ? 93 : 142}">Fish Meal - ₹${currentMealPlan === 'general' ? 93 : 142}/day</option>
    `;
    mealSelect.addEventListener('change', updateTotalCost);
    dayMeal.appendChild(mealSelect);

    mealSelectionContainer.appendChild(dayMeal);
  });

  weekdayMeals.classList.remove('hidden');
}

function updateTotalCost() {
  let mealPlanPrice = 0;

  if (customMealOptions.classList.contains('hidden')) {
    mealPlanPrice = parseInt(document.querySelector('.select-plan[data-plan]:not([data-plan="custom"])').dataset.plan);
  } else {
    const mealSelects = document.querySelectorAll('#meal-selection-container select');
    mealSelects.forEach((select) => {
      mealPlanPrice += parseInt(select.value);
    });
  }

  const numPersons = parseInt(numPersonsInput.value);
  totalCost = mealPlanPrice * numPersons;

  // Calculate GST (12%)
  const gst = totalCost * 0.12;

  // Calculate total billed amount
  let totalBilledAmount = totalCost + gst + packagingFee;

  // Apply free delivery discount
  if (isFreeDelivery) {
    deliveryFeeDisplay.textContent = '0';
    deliveryDiscount.classList.add('hidden');
    freeDeliveryMessage.classList.remove('hidden');
  } else {
    totalBilledAmount += deliveryFee;
    deliveryFeeDisplay.textContent = deliveryFee;
    deliveryDiscount.classList.remove('hidden');
    freeDeliveryMessage.classList.add('hidden');
  }

  // Update displays
  mealCostDisplay.textContent = totalCost;
  gstDisplay.textContent = gst.toFixed(2);
  packagingFeeDisplay.textContent = packagingFee.toFixed(2);
  totalBilledAmountDisplay.textContent = totalBilledAmount.toFixed(2);
}

function showTotalBill() {
  subscriptionPage.classList.add('hidden');
  totalBillPage.classList.remove('hidden');

  billMealCost.textContent = totalCost;
  billGst.textContent = (totalCost * 0.12).toFixed(2);
  billDeliveryFee.textContent = isFreeDelivery ? '0' : '140';
  billPackagingFee.textContent = packagingFee.toFixed(2);
  billTotalAmount.textContent = (totalCost + (totalCost * 0.12) + (isFreeDelivery ? 0 : 140) + packagingFee).toFixed(2);
}