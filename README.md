
# React Previewer

A powerful React application for generating, editing, and previewing React code dynamically. This project integrates with AI and Figma plugins to streamline the design-to-code workflow, making it easy to convert Figma frames into optimized React code or modify existing code with AI assistance.

---

## Table of Contents

- [React Previewer](#react-previewer)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Setup and Installation](#setup-and-installation)
    - [Prerequisites](#prerequisites)
    - [Installation Steps](#installation-steps)
  - [Running the Project](#running-the-project)
    - [Development Mode](#development-mode)
    - [Production Mode](#production-mode)
  - [Usage](#usage)
    - [Code Editing](#code-editing)
    - [Chatbot Assistance](#chatbot-assistance)
    - [Figma Plugin](#figma-plugin)
  - [Figma Plugin Integration](#figma-plugin-integration)
  - [Scripts](#scripts)
    - [Available Commands](#available-commands)


---

## About

React Previewer simplifies the React development process by integrating:
- **Dynamic Code Editing**: Edit and preview React components in real-time.
- **AI-Assisted Development**: Generate and modify code snippets via AI.
- **Figma-to-React Workflow**: Convert Figma designs into functional React code.


---

## Features

- **Dynamic Preview**: Edit and see live updates of your React components.
- **AI Integration**: Use AI to enhance and modify code snippets directly.
- **Figma Plugin Support**: Extract frames from Figma and convert them into React components.
- **Code Editor Options**: Toggle between showing/hiding the editor for a clean workspace.
- **Chatbot Assistance**: Integrated chatbot for interacting with AI to generate or debug code.
- **Dark Mode**: A beautiful dark theme for enhanced user experience.

---

## Technologies Used

- **Frontend**: React.js, Next.js
- **UI Components**: Sandpack Code Editor, Custom Themes
- **Styling**: TailwindCSS, Inline Styles
- **AI Integration**: OpenAI/Anthropic API
- **Figma Integration**: Figma plugin for design-to-code conversion

---

## Setup and Installation

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v16 or later
- **npm** or **yarn**

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd react-previewer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

---

## Running the Project

### Development Mode
Start the development server:
```bash
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

### Production Mode
Build and start the application:
```bash
npm run build
npm start
```

---

## Usage

### Code Editing
- Open the project in your browser.
- Use the integrated editor to modify code dynamically.
- Preview the results in real-time.

### Chatbot Assistance
- Interact with the chatbot to:
  - Generate React code.
  - Modify existing code.
  - Debug issues or get suggestions.

### Figma Plugin
- Extract frames from Figma designs using the associated plugin.
- Generate React code from the design and preview it instantly.

---

## Figma Plugin Integration

The Figma plugin extracts design data and converts it into React code. To use:
1. Install the Figma plugin from [Figma Plugin URL].
2. Select a frame in Figma.
3. Click "Generate React Code" in the plugin interface.
4. The generated code is sent to the React Previewer for real-time editing and preview.

---

## Scripts

### Available Commands

- **`npm run dev`**: Start the development server.
- **`npm run build`**: Build the application for production.
- **`npm run start`**: Run the application in production mode.
- **`npm run lint`**: Lint and fix code issues.




