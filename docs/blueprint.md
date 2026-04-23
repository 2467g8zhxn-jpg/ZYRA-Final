# **App Name**: ZYRA Command

## Core Features:

- Secure User Authentication: Allows users to register and log in/out via email and password. Includes custom claims or a user document to define 'admin' or 'employee' roles.
- Employee Profile & Gamification Dashboard: Displays user's personal details, current points, level, and daily report submission streak, motivating continued engagement.
- Project List & Detail View: Provides employees with an overview of assigned projects, showing status, client information, description, and geographical location.
- Team Collaboration Interface: Enables users to view their assigned team members, leader, and the current project allocated to their team.
- Operational Report Submission: Facilitates submission of daily operational reports, including text content and optional image uploads directly to Firebase Storage, organized by projectID.
- AI-Powered Report Assistant: A generative AI tool that assists employees in drafting and structuring comprehensive report descriptions, ensuring all necessary details are included and presented clearly.
- Automated Gamification System: A backend system using Cloud Functions to automatically award points, increment user levels based on thresholds, and update daily streaks upon report submission.

## Style Guidelines:

- Overall Color Scheme: Dark theme for a sophisticated, high-tech operational aesthetic, optimizing for screen comfort in various lighting conditions.
- Background Color: A deep, desaturated purple-gray (#19161D) providing a clean and non-distracting canvas for content and interactive elements.
- Primary Color: A vibrant light blue-cyan (#63D9F0) for primary text, interactive components, and essential information, offering excellent contrast and a futuristic feel against the dark background.
- Accent Color: Electric Violet (#8A2BE2) for call-to-actions, highlights, loaders, and notification messages, emphasizing key interactions and maintaining brand consistency.
- Font Family: 'Instrument Sans' for all textual elements, delivering a modern, clean, and highly readable appearance across the application.
- Icons: Use modern, minimalist line icons that align with the high-tech visual identity. Icons should leverage shades of the primary and accent colors for cohesion.
- Transitions & Loaders: Incorporate subtle, smooth transitions for UI changes. All loaders and toast notifications should feature the Electric Violet (#8A2BE2) accent color, reinforcing brand elements during feedback states.