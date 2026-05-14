
# 🚀 Step-by-Step Deployment Guide

Follow these steps exactly to make your app live and **save your data permanently**.

---

## 🆘 CANNOT FIND THE DOWNLOAD ICON ON MOBILE?
If you are on a phone and can't find the download button:
1.  **THE BLUE BANNER**: At the very top of your screen is a blue bar. Click **"Move now"**. This will connect your project to GitHub automatically.
2.  **Landscape Mode**: Turn your phone sideways. The download icon (cloud with arrow) might appear in the top right header.
3.  **Desktop Site**: Tap the three dots in Chrome and select "Desktop site".

---

## Part 1: Connect to Vercel (FIX DATA ERASING)

You must add **6 Keys** to Vercel. Go to Vercel -> Your Project -> **Settings** -> **Environment Variables**.

| Key (Top Box) | Value (From Firebase) |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |

---

## Part 2: 🛑 THE "REDEPLOY" STEP (Mandatory!)
Even after adding keys, the site **will not work** until you do this:
1.  In Vercel, click the **"Deployments"** tab at the top.
2.  Click the **three dots (...)** next to the latest build.
3.  Click **"Redeploy"**.
4.  Once it finishes, open your website. The "Demo Mode" warning should be gone.

---

## Part 3: Ongoing Updates
Every time we make a change in this chat:
1.  **Use the "Move now" button** (in the blue banner) to push changes to GitHub.
2.  Vercel will update the site automatically.
3.  Check the "Build Number" in the app footer to verify you have the latest version.

---

## ⚠️ Troubleshooting "Database Disconnected"
If the app still says "Demo Mode" after redeploying:
1.  **Check for Spaces**: Ensure you didn't paste a space at the end of any Key or Value in Vercel.
2.  **Verify names**: Ensure keys start with `NEXT_PUBLIC_FIREBASE_`.
3.  **Redeploy again**: Vercel sometimes takes 2 minutes to propagate new keys.
