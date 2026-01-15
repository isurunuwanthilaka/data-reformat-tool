# Data Reformatter Tool

A web-based tool to reformat Excel data by unpivoting repeating household member sections into separate rows.

## 🚀 Live Demo
**[Use the Tool Online](https://isurunuwanthilaka.github.io/data-reformat-tool/)**

## ✨ Features
- **Browser-Based Processing**: All data stays on your device. No files are uploaded to a server.
- **Unpivoting Logic**: Converts wide-format data (multiple members in one row) into long-format (one row per member).
- **Smart Filling**: Keys common household data to the first member only, keeping subsequent member rows clean.
- **Data Cleaning**: Automatically removes technical/metadata columns (`GN_ID`, etc.) from member blocks.
- **Dynamic Row Generation**: Generates rows strictly based on the "Number of household members" column.

## 🛠️ Project Structure
- **`reformat-data-ui/`**: The modern Next.js web application (React, Tailwind CSS, XLSX).
- **`start-here.py` / `reformat_data.py`**: Legacy Python scripts used for initial prototyping (reference only).

## 💻 Running Locally

Requirements: [Node.js](https://nodejs.org/) (v18+)

1. Navigate to the web app directory:
   ```bash
   cd reformat-data-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment
This project is configured to deploy automatically to **GitHub Pages** via GitHub Actions.
- Pushing to the `main` branch triggers the workflow in `.github/workflows/nextjs.yml`.
- The site is built as a static export (`output: 'export'`) and served from the `gh-pages` branch.
