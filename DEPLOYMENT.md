# Deploying LinkClub Backend to Render

This guide will help you deploy your backend to Render's free tier.

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Your code pushed to GitHub

## Step 1: Push Your Code to GitHub

Make sure all your latest changes are committed and pushed:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

## Step 2: Create a Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

## Step 3: Deploy Your Backend

### Option A: Using render.yaml (Recommended - Infrastructure as Code)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository (LinkClub)
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"**

### Option B: Manual Setup

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (LinkClub)
4. Configure the following:
   - **Name**: `linkclub-backend`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

## Step 4: Add Environment Variables

In the Render dashboard, go to your service → **Environment** tab and add these variables:

```
MONGODB_URI=mongodb+srv://6531503172:bc1F1BaLtFTpdISA@cluster0.nze2b5k.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0
PORT=10000
JWT_SECRET=0SHB/iIwkqein1JfwGeIsUYUhBegVc4e006kL808KMY=
CLOUDINARY_CLOUD_NAME=dqaklhcim
CLOUDINARY_API_KEY=791322342577171
CLOUDINARY_API_SECRET=Y5IstQu25w4rI8Rt0VCUa_4344w
FRONTEND_URL=https://linkclub.netlify.app
NODE_ENV=production
STREAM_API_KEY=tvr7h9qsbhpg
STREAM_API_SECRET=r4wxh5f4h2xsu24qm2y98b7xjsmq7wvjz2v44uaywd3myvy84mne6xena3smqavn
```

**Important**: Copy these from your `.env` file. Don't share these publicly!

## Step 5: Deploy

1. Click **"Create Web Service"** (or **"Apply"** if using Blueprint)
2. Render will start building and deploying your app
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Your backend URL will be: `https://linkclub-backend.onrender.com`

## Step 6: Update Frontend

Once deployed, you need to update your frontend to use the new backend URL.

The backend URL will be something like:
```
https://linkclub-backend.onrender.com
```

Update your frontend configuration to point to this new URL.

## Important Notes

### Free Tier Limitations
- **Spin down after 15 minutes of inactivity**: Your service will sleep after 15 minutes of no requests
- **Spin up time**: First request after sleep takes 30-50 seconds
- **750 hours/month**: Free tier includes 750 hours of runtime per month

### Keeping Your Service Awake (Optional)
If you want to prevent the service from sleeping, you can:
1. Use a service like **UptimeRobot** (free) to ping your backend every 14 minutes
2. Upgrade to a paid plan ($7/month) for always-on service

### Auto-Deploy
Render automatically deploys when you push to your main branch on GitHub.

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify build command is correct

### Service Won't Start
- Check the service logs in Render dashboard
- Verify environment variables are set correctly
- Ensure MongoDB connection string is correct

### CORS Errors
- Make sure `FRONTEND_URL` is set to your Netlify URL
- Check CORS configuration in `backend/src/index.js`

## Next Steps

After deployment:
1. Test your backend endpoints
2. Update frontend to use new backend URL
3. Test the full application flow
4. Set up monitoring (optional)

## Support

If you encounter issues:
- Check Render documentation: https://render.com/docs
- Review service logs in Render dashboard
- Check GitHub repository settings
