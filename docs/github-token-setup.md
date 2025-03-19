# Setting up GitHub Personal Access Token for Actions Workflow

For the GitHub Actions workflow to automatically update the Homebrew formula, you need to create a Personal Access Token (PAT) with the right permissions and add it to your repository's secrets.

## Step 1: Create a Personal Access Token

1. Go to your GitHub account settings
2. Click on "Developer settings" in the sidebar
3. Click on "Personal access tokens" and then "Tokens (classic)"
4. Click "Generate new token" and then "Generate new token (classic)"
5. Give your token a descriptive name like "ClipHit Release Automation"
6. Set an expiration date (or select "No expiration" if you prefer)
7. Select the following scopes:
   - `repo` (Full control of private repositories)
8. Click "Generate token"
9. **Important**: Copy the token immediately as you won't be able to see it again

## Step 2: Add Token to Repository Secrets

1. Go to your repository on GitHub
2. Click on "Settings"
3. Click on "Secrets and variables" in the sidebar, then "Actions"
4. Click on "New repository secret"
5. Enter `PERSONAL_ACCESS_TOKEN` as the name
6. Paste your token in the value field
7. Click "Add secret"

## Step 3: Verify Workflow Permissions

1. In your repository, go to "Settings"
2. Click on "Actions" in the sidebar
3. Scroll down to "Workflow permissions"
4. Ensure that "Read and write permissions" is selected
5. Click "Save" if you made any changes

## Testing

To test that everything is set up correctly:

1. Make a small change to your project
2. Update the version in `package.json`
3. Run `yarn release X.Y.Z` to create and push a new tag
4. Go to the "Actions" tab in your repository to verify the workflow runs successfully

If the workflow completes without errors, it means the token is configured correctly and the automation is working as expected. 