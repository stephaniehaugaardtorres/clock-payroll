GPS Workforce Time Tracker:

A React web application that allows employees to clock in and out using GPS verification, automatically track work sessions, and estimate payroll based on recorded hours.

The app enforces geofencing rules, prevents duplicate clock-ins, manages break periods, and stores punch data locally for persistence.

Features:

GPS Clock-In Validation:

Employees must be physically within a defined worksite radius to clock in.

Geofence Protection:

The app calculates the distance between the user's GPS location and the worksite to ensure they are within the allowed range.

GPS Accuracy Check:

Clock-ins are blocked if GPS accuracy is too low to prevent unreliable location readings.

Break Enforcement:

A configurable break period prevents users from clocking back in before the break time has elapsed.

Punch History:

All clock-in and clock-out events are stored and used to reconstruct work sessions.

Timesheet Generation:

The app converts punch data into completed work sessions displayed in a timesheet.

Payroll Estimation:

Estimated pay is calculated based on:
    - hourly rate
    - optional flat rate

Persistent Storage:

Punch data and pay settings are saved using localStorage so the data persists between page refreshes.

Demo Reset:

A reset button allows quick clearing of stored data for testing.

Tech Stack:
    - React
    - JavaScript
    - Vite
    - Geolocation API
    - LocalStorage
    - HTML/CSS

How It Works:
    1. User presses Clock In.
    2. The browser requests GPS location
    3. The app verifies:
        - GPS accuracy
        - distance from worksite
    4. If valid, a punch record is saved.
    5. When the user clocks out, a session is created.
    6. Sessions are used to calculate:
        - total hours worked
        - estimated payroll

Project Structure:

src
 ├─ components
 │   └─ Dashboard.jsx
 ├─ lib
 │   ├─ distance.js
 │   ├─ geolocation.js
 │   ├─ payroll.js
 │   └─ storage.js
 └─ main.jsx

Example Workflow:
    1. Clock In
    2. Work period begins
    3. Clock Out
    4. Session recorded
    5. Break timer begins
    6. Clock In again after break
    7. Timesheet updates
    8. Payroll estimate recalculates

Environment Variables:

VITE_WORKSITE_NAME
VITE_WORKSITE_LAT
VITE_WORKSITE_LNG
VITE_WORKSITE_RADIUS_METERS
VITE_MAX_GPS_ACCURACY_METERS

Future Improvements:

Possible enhancements:
    - Export timesheet to CSV
    - Cloud database storage
    - Authentication system
    - Manager dashboard
    - Mobile-first UI improvements
    - Multi-employee support

Author:

Nicole Stephanie Haugaard Torres
Atlanta, Georgia

License:

This project is open for educational and portfolio use.
