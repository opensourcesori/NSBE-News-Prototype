// Google Calendar API Integration
// This code should be included in your project to sync with Google Calendar

// 1. First, include the Google API client library in your HTML
// <script src="https://apis.google.com/js/api.js"></script>
// <script src="https://accounts.google.com/gsi/client"></script>

// 2. Set up your Google API credentials and calendar configuration
const CONFIG = {
  apiKey: 'TAMU_API_KEY', // Replace with your actual API key
  clientId: 'TAMU_CLIENT_ID', // Replace with your actual client ID
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  scopes: 'https://www.googleapis.com/auth/calendar.readonly',
  calendarId: 'YOUR_CALENDAR_ID@group.calendar.google.com' // Replace with NSBE calendar ID
};

// 3. Function to initialize the Google API client
function initGoogleCalendar() {
  gapi.load('client:auth2', startGoogleCalendar);
}

function startGoogleCalendar() {
  gapi.client.init({
    apiKey: CONFIG.apiKey,
    clientId: CONFIG.clientId,
    discoveryDocs: CONFIG.discoveryDocs,
    scope: CONFIG.scopes
  }).then(() => {
    // Listen for sign-in state changes
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    
    // Handle the initial sign-in state
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    
    // Add button event handlers if needed
    document.getElementById('authorize-button').onclick = handleAuthClick;
    document.getElementById('signout-button').onclick = handleSignoutClick;
  });
}

// 4. Function to update UI based on sign-in status
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    // User is signed in, fetch calendar events
    fetchCalendarEvents();
  } else {
    // User is signed out, update UI accordingly
    clearCalendarEvents();
    showSignInPrompt();
  }
}

// 5. Function to fetch calendar events
function fetchCalendarEvents() {
  // Get current date and a date 30 days in the future
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  
  gapi.client.calendar.events.list({
    'calendarId': CONFIG.calendarId,
    'timeMin': now.toISOString(),
    'timeMax': endDate.toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime'
  }).then(response => {
    const events = response.result.items;
    displayCalendarEvents(events);
    updateCalendarDisplay(events);
  });
}

// 6. Function to display calendar events in the UI
function displayCalendarEvents(events) {
  const container = document.querySelector('#calendar-tab .section-title + div');
  container.innerHTML = ''; // Clear existing events
  
  if (events.length === 0) {
    container.innerHTML = '<p>No upcoming events found.</p>';
    return;
  }
  
  events.forEach(event => {
    // Parse event date and time
    const startDateTime = new Date(event.start.dateTime || event.start.date);
    const endDateTime = new Date(event.end.dateTime || event.end.date);
    
    // Format date and time
    const month = startDateTime.toLocaleString('default', { month: 'short' });
    const day = startDateTime.getDate();
    const timeStr = event.start.dateTime ? 
      `${startDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
       ${endDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
      'All day';
    
    // Create event card
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
      <div class="event-date">
        <div class="event-month">${month}</div>
        <div class="event-day">${day}</div>
      </div>
      <div class="event-details">
        <div class="event-title">${event.summary}</div>
        <div class="event-time"><i class="far fa-clock"></i> ${timeStr}</div>
        ${event.location ? 
          `<div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : 
          ''}
      </div>
    `;
    
    container.appendChild(eventCard);
  });
}

// 7. Function to update calendar display with event indicators
function updateCalendarDisplay(events) {
  const calendarDates = document.querySelectorAll('.calendar-date');
  
  // Clear existing event indicators
  calendarDates.forEach(date => date.classList.remove('has-event'));
  
  // Mark dates with events
  events.forEach(event => {
    const eventDate = new Date(event.start.dateTime || event.start.date);
    const eventDay = eventDate.getDate();
    
    // Find the corresponding calendar day and mark it
    calendarDates.forEach(dateElement => {
      const dayText = parseInt(dateElement.textContent);
      if (dayText === eventDay) {
        dateElement.classList.add('has-event');
      }
    });
  });
}

// 8. Function to handle user sign-in
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

// 9. Function to handle user sign-out
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}

// 10. Function to clear calendar events from UI
function clearCalendarEvents() {
  const container = document.querySelector('#calendar-tab .section-title + div');
  container.innerHTML = '';
}

// 11. Function to show sign-in prompt
function showSignInPrompt() {
  const container = document.querySelector('#calendar-tab .section-title + div');
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Calendar Access</div>
      <p>Sign in to access the NSBE events calendar.</p>
      <button id="authorize-button" class="primary" style="margin-top: 15px;">Sign In</button>
    </div>
  `;
}

// 12. Function to generate a complete calendar view
function generateCalendarView(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Update calendar header
  document.querySelector('.calendar-month').textContent = `${monthNames[month]} ${year}`;
  
  // Clear existing calendar grid
  const calendarGrid = document.querySelector('.calendar-grid');
  
  // Keep the day headers
  const dayHeaders = document.querySelectorAll('.calendar-day-header');
  calendarGrid.innerHTML = '';
  
  // Re-add day headers
  for (let i = 0; i < 7; i++) {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day';
    dayHeader.innerHTML = `<div class="calendar-day-header">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</div>`;
    calendarGrid.appendChild(dayHeader);
  }
  
  // Add days from previous month to fill first row
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

  for (let i = 0; i < startingDayOfWeek; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.innerHTML = `<div class="calendar-date prev-month">${daysInPrevMonth - startingDayOfWeek + i + 1}</div>`;
    calendarGrid.appendChild(day);
  }
  
  // Add days of current month
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    
    // Check if it's today
    let dateClass = 'calendar-date';
    if (isCurrentMonth && i === today.getDate()) {
      dateClass += ' today';
    }
    
    day.innerHTML = `<div class="${dateClass}">${i}</div>`;
    day.querySelector('.calendar-date').addEventListener('click', () => selectDate(year, month, i));
    calendarGrid.appendChild(day);
  }
  
  // Add days from next month to fill last row
  const totalCells = 42; // 6 rows of 7 days
  const cellsToFill = totalCells - (startingDayOfWeek + daysInMonth);
  
  for (let i = 1; i <= cellsToFill; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.innerHTML = `<div class="calendar-date next-month">${i}</div>`;
    calendarGrid.appendChild(day);
  }
  
  // After generating the calendar, fetch and display events
  if (gapi.auth2 && gapi.auth2.getAuthInstance().isSignedIn.get()) {
    fetchCalendarEvents();
  }
}

// 13. Function to handle date selection
function selectDate(year, month, day) {
  // Create date object for selected date
  const selectedDate = new Date(year, month, day);
  const nextDay = new Date(year, month, day);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Fetch events for this specific date
  gapi.client.calendar.events.list({
    'calendarId': CONFIG.calendarId,
    'timeMin': selectedDate.toISOString(),
    'timeMax': nextDay.toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime'
  }).then(response => {
    const events = response.result.items;
    displayDayEvents(events, selectedDate);
  });
}

// 14. Function to display events for a specific day
function displayDayEvents(events, date) {
  // Create a modal or panel to show events
  const eventsContainer = document.createElement('div');
  eventsContainer.className = 'day-events-modal';
  
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let modalContent = `
    <div class="modal-header">
      <h3>Events for ${dateStr}</h3>
      <button class="close-button">&times;</button>
    </div>
    <div class="modal-body">
  `;
  
  if (events.length === 0) {
    modalContent += '<p>No events scheduled for this day.</p>';
  } else {
    events.forEach(event => {
      const startTime = event.start.dateTime ? 
        new Date(event.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
        'All day';
        
      const endTime = event.end.dateTime ? 
        new Date(event.end.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
        '';
        
      const timeStr = endTime ? `${startTime} - ${endTime}` : startTime;
      
      modalContent += `
        <div class="modal-event">
          <h4>${event.summary}</h4>
          <p class="event-time"><i class="far fa-clock"></i> ${timeStr}</p>
          ${event.location ? `<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>` : ''}
          ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
        </div>
      `;
    });
  }
  
  modalContent += `
    </div>
    <div class="modal-footer">
      <button class="secondary close-modal">Close</button>
    </div>
  `;
  
  eventsContainer.innerHTML = modalContent;
  document.body.appendChild(eventsContainer);
  
  // Add event listeners for closing the modal
  eventsContainer.querySelector('.close-button').addEventListener('click', () => {
    document.body.removeChild(eventsContainer);
  });
  
  eventsContainer.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(eventsContainer);
  });
  
  // Add styles for the modal
  const style = document.createElement('style');
  style.textContent = `
    .day-events-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 90%;
      max-width: 500px;
      z-index: 1000;
    }
    
    .modal-header {
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
    
    .modal-body {
      padding: 15px;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .modal-event {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .modal-event:last-child {
      border-bottom: none;
    }
    
    .modal-footer {
      padding: 15px;
      border-top: 1px solid #eee;
      text-align: right;
    }
  `;
  
  document.head.appendChild(style);
}

// 15. Functions to navigate between months
function previousMonth() {
  const currentMonthText = document.querySelector('.calendar-month').textContent;
  const [monthName, year] = currentMonthText.split(' ');
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  let monthIndex = monthNames.indexOf(monthName);
  let yearNum = parseInt(year);
  
  // Go to previous month
  monthIndex--;
  if (monthIndex < 0) {
    monthIndex = 11;
    yearNum--;
  }
  
  generateCalendarView(yearNum, monthIndex);
}

function nextMonth() {
  const currentMonthText = document.querySelector('.calendar-month').textContent;
  const [monthName, year] = currentMonthText.split(' ');
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  let monthIndex = monthNames.indexOf(monthName);
  let yearNum = parseInt(year);
  
  // Go to next month
  monthIndex++;
  if (monthIndex > 11) {
    monthIndex = 0;
    yearNum++;
  }
  
  generateCalendarView(yearNum, monthIndex);
}

// 16. Initialize calendar
function initCalendar() {
  const now = new Date();
  generateCalendarView(now.getFullYear(), now.getMonth());
  
  // Add event listeners for month navigation
  document.querySelector('.calendar-header button:first-child').addEventListener('click', previousMonth);
  document.querySelector('.calendar-header button:last-child').addEventListener('click', nextMonth);
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initCalendar();
  initGoogleCalendar();
});
