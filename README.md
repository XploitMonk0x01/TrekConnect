# TrekConnect 🏔️

TrekConnect is a modern, AI-powered travel application designed to connect trekkers, help them discover new destinations, and share their adventures. Built with Next.js and Firebase, it offers a seamless and interactive experience for travel enthusiasts.

## ✨ Features

*   **Explore Destinations**: Discover and learn about various trekking destinations, complete with photos, weather information, and AI-generated custom route planning.
*   **ConnectSphere**: A Tinder-like swiping interface to find and connect with other trekkers based on their profiles.
*   **Real-time Chat**: Once matched, engage in one-on-one real-time chat to plan your next adventure.
*   **AI-Powered Recommendations**: Get smart suggestions for travel companions and new treks to explore based on your profile and preferences.
*   **Photo & Story Feed**: Share your travel photos and write inspiring stories from your journeys for the community to see.
*   **User Profiles**: Create and customize your profile to showcase your trekking experience, travel style, and wishlist.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
*   **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) with Gemini models
*   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Realtime Database for chat)
*   **Database (Legacy)**: MongoDB was previously used and is being migrated from.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the necessary Firebase and other API credentials. You can use `.env.example` as a template.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

5.  **Run the Genkit development server:**
    For AI features, you'll need to run the Genkit server in a separate terminal:
    ```bash
    npm run genkit:dev
    ```

## 📂 Project Structure

*   `src/app/`: Main application routes using the Next.js App Router.
*   `src/components/`: Reusable React components.
*   `src/contexts/`: React context providers for state management (e.g., Auth, Chat).
*   `src/ai/`: Contains all Genkit flows for AI-powered features.
*   `src/lib/`: Core libraries, constants, and Firebase configuration.
*   `src/services/`: Functions for interacting with backend services (Firebase, Pexels API, etc.).
*   `public/`: Static assets like images and fonts.
