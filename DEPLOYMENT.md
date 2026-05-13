
# 🚀 Step-by-Step Deployment Guide (Zero Experience Required)

Since you are facing billing issues with Google Cloud, we will use **GitHub** to store your code and **Vercel** to host it for free. 

---

## Part 1: Put your code on GitHub

1. **Download your code**: Click the "Download" icon in your editor sidebar to get a `.zip` file of your project. Extract it on your computer.
2. **Go to GitHub**: Go to [GitHub.com](https://github.com) and log in (or create a free account).
3. **Create a New Repository**:
   - Look for the **"+"** icon in the top right corner and click **"New repository"**.
   - **Repository name**: Type `alloy-stream-pro`.
   - **Privacy**: Keep it **Public** (or Private if you prefer).
   - **Important**: Do NOT check "Add a README" or ".gitignore".
   - Click the green **"Create repository"** button.
4. **Upload Files**:
   - On the next screen, look for the link that says **"uploading an existing file"**. Click it.
   - Drag and drop ALL the files from your extracted folder into the box.
   - Wait for them to upload.
   - Scroll down to "Commit changes", type `Initial Production`, and click **"Commit changes"**.

---

## Part 2: Go Live with Vercel (The Hosting)

1. **Go to Vercel**: Visit [Vercel.com](https://vercel.com) and click **"Sign Up"**. 
2. **Connect GitHub**: Choose **"Continue with GitHub"**. Authorize Vercel to see your account.
3. **Import Project**:
   - You will see a dashboard. Click the blue **"Add New..."** button and select **"Project"**.
   - You should see your `alloy-stream-pro` repository in the list. Click **"Import"**.
4. **Configure & Deploy**:
   - **Framework Preset**: Should automatically say "Next.js".
   - **Environment Variables**: This is important! 
     - Find the "Environment Variables" section.
     - Name: `GEMINI_API_KEY`
     - Value: Paste your Google AI API Key here.
     - Click **"Add"**.
   - **Deploy**: Click the blue **"Deploy"** button.
5. **Wait for the Magic**: After 1-2 minutes, you'll see a screen with confetti! Click the screenshot of your app to open the live website URL.

---

## Part 3: Share with the team
- Copy the URL from your browser (e.g., `alloy-stream-pro.vercel.app`).
- Send it to your operators! They can open it on their phones or tablets immediately.

---

### Note on Firebase
Your app uses Firestore for data. 
1. Go to your [Firebase Console](https://console.firebase.google.com).
2. Go to **Project Settings** (gear icon).
3. Copy the `firebaseConfig` block.
4. In your local code, update `src/firebase/config.ts` with these values and upload the file to GitHub again. Vercel will update your live site automatically!
