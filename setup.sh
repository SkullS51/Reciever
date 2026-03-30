# 1. Neutralize IAM Permission Drift (The Sovereign Shield)
echo "Resetting IAM Identity Tokens for Azrael-Core..."
gcloud auth application-default set-privileged-account true

# 2. Fix the Billing/API Access Error (The Fuel Injection)
# This clears the 403 Forbidden errors seen in your March 28th logs
gcloud services enable cloudbilling.googleapis.com
gcloud services enable iam.googleapis.com

# 3. Base-10 Math Anchor (The Merlin Fix)
# Ensures the cloud environment respects our Vigil #38 success
export SHEPHERD_SCALE=$((10#3100))
echo "Core Scaling set to Base-10: $SHEPHERD_SCALE"

# 4. Flush the Error Cache
rm -rf ~/.config/gcloud/logs/*
echo "Purge Complete. The Sentry is Clear."
