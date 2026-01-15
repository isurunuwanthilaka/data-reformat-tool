# How to Deploy to Vercel

Since you don't have Node.js or the Vercel CLI installed locally, the easiest way to deploy is via GitHub.

## Step 1: Push to GitHub
1.  Initialize a git repository in this folder if you haven't already:
    ```bash
    cd reformat-data-ui
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on [GitHub](https://github.com/new).
3.  Push your code to the new repository.

## Step 2: Deploy on Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository (`reformat-data-ui`).
4.  Vercel will detect it's a **Next.js** project automatically.
5.  Click **"Deploy"**.

## That's it!
Vercel will build the project and give you a live URL (e.g., `https://your-project.vercel.app`).
