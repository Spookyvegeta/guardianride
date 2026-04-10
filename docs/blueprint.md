# **App Name**: GuardianRide

## Core Features:

- Worker Profile & Onboarding: Enables gig workers to register and manage their personal, medical, and emergency contact details, including the platforms they work on.
- Offline QR Medical Card: Generates a unique, scannable QR code storing essential medical and emergency contact information for rapid, offline access by first responders.
- Real-time Accident Detection: An on-device AI model continuously analyzes sensor data (accelerometer, gyroscope, GPS) for specific accident signatures, providing an immediate confidence score.
- Emergency Confirmation System: Activates a 30-second 'Are You Okay?' prompt with a countdown timer, designed to confirm an incident and prevent false positives before full emergency escalation.
- Automated Emergency Notifications: Triggers sequential alerts to registered emergency contacts (via WhatsApp and voice calls) and automated calls to emergency services (108), transmitting critical location and medical data.
- Platform Incident Notification: Automatically informs specified gig-work platforms about an incident via webhooks, enabling them to re-assign orders or initiate their own safety protocols.
- Incident Reporting & Analytics: Allows workers to log post-incident details (e.g., hospital, outcome) and contributes to an anonymized aggregate database for generating public safety reports and accident heatmaps.

## Style Guidelines:

- Primary color: A vibrant, clear magenta-pink (#FC47C9) for crucial alerts and actionable elements, ensuring visibility against a dark theme and conveying urgency with a tech-forward feel.
- Background color: A very dark, desaturated purplish-gray (#2E1F2C) provides a subdued canvas suitable for reduced eye strain during late-night usage, creating a serious and modern tone.
- Accent color: A bright, distinct lavender-purple (#CC8CF7) to highlight secondary information, key distinctions, and offer visual contrast for clarity.
- Main font: 'Inter' (sans-serif) for all text elements (headlines and body). Its clear, objective, and highly readable design ensures critical information is conveyed effectively to all users.
- Icons should be clear, minimalist, and immediately understandable, using high contrast against the dark background. Prioritize symbols for safety, alerts, location, and medical information.
- The layout should be clean, uncluttered, and highly hierarchical. Emergency-related screens require maximum visual prominence, with key action buttons prominently displayed and easy to tap under duress.
- Subtle, smooth transitions for general app navigation. For critical alerts (e.g., the 'Are You Okay?' prompt), employ assertive animations like pulsing effects combined with haptic feedback to ensure immediate user attention.