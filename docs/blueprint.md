# **App Name**: PlantSpeakAI

## Core Features:

- Live Plant Data Dashboard: Display real-time plant bio-electrical data (Raw Value, Difference, Average, Stress Label) fetched from the ThingSpeak API with automatic refresh every 15 seconds.
- Stress Status Visualization: Clearly present the current plant condition using descriptive labels, emojis, and visual indicators based on the received stress label (e.g., 0 for Healthy, 1 for Water Stress).
- AI Care Advisor: Provide instant, actionable solutions or recommendations tailored to the detected plant stress type (e.g., 'Water the plant' for Water Stress) displayed in a highlighted box.
- Interactive AI Chatbot Tool: A floating, multi-language chatbot interface (English, Tamil, Hindi) that uses AI to filter and respond only to queries related to PlantSpeakAI, plant care, sensors, ESP32, or stress detection.
- Voice Input for Chatbot: Enable users to interact with the chatbot through browser speech recognition, converting spoken queries to text input via a microphone button.
- Real-time Stress Alerts: Deliver immediate pop-up notifications upon stress detection (stress label ≠ 0) and a special alert, 'Pump Activated', specifically for water stress conditions.
- Dynamic UI Theming & Responsiveness: Implement a modern, card-based layout with soft colors, smooth animations, integrated loading indicators, a dark mode toggle, and full mobile responsiveness for optimal viewing on all devices.

## Style Guidelines:

- Primary color: Muted, deep forest green (#569963). This hue firmly establishes a connection to nature and health, while offering a contemporary and grounding visual presence that contrasts effectively with lighter UI elements.
- Background color: A very light, desaturated green-gray (#EBEFE4). This subtly harmonious color choice echoes the primary hue, providing a clean, airy, and unobtrusive canvas for content within the default light mode.
- Accent color: A bright, lively yellow-green (#C8F0A0). This hue is analogous to the primary and chosen for its ability to provide a vibrant 'pop' of freshness and vitality, creating strong visual contrast for interactive components, highlights, and crucial status indicators.
- Headline and body font: 'Inter', a grotesque-style sans-serif. Its contemporary, precise, and neutral aesthetic guarantees optimal readability across all content, contributing to the app's clean, technological, and objective design language.
- Utilize simple, clean, and immediately recognizable line-art or filled icons for representing different plant stress types, recommended actions, and primary UI navigation. Icons will maintain consistency with the minimalist and modern aesthetic.
- All primary content sections will adopt a modular, card-based layout, enhancing visual organization and readability. The layout is engineered to be fully responsive, seamlessly adapting with appropriate spacing and alignment across diverse screen sizes.
- Incorporate subtle and smooth animations for transitions between states, updates to data, and user interactions. This includes delicate effects for loading indicators, alert pop-ups, and the dark mode toggle, aiming to enrich the user experience without causing distraction.