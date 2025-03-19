# Forge Hello World

This project contains a Forge app written in Javascript that displays `Hello World!` in a Bitbucket Pull Request Overview Panel. 

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

- Modify your app frontend by editing the `src/frontend/index.jsx` file.

- Modify your app backend by editing the `src/resolvers/index.js` file to define resolver functions. See [Forge resolvers](https://developer.atlassian.com/platform/forge/runtime-reference/custom-ui-resolver/) for documentation on resolver functions.

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in a Bitbucket workspace by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new workspace.
- Once the app is installed on a workspace, the workspace picks up the new app changes you deploy without needing to rerun the install command.

## Setting environment Variables

For the forge backend to work with forge **tunnel** you need to set
```shell
export FORGE_USER_VAR_USERN=workzone_account_username
export FORGE_USER_VAR_PASSW=workzone_account_user_app_password
```
https://developer.atlassian.com/platform/forge/environments-and-versions/

## Bitbucket repo configuration
It is important that the logged in user that pushes the merge button does not have 'merge' or 'write' permissions for the target branch

<img width="706" alt="image" src="https://github.com/user-attachments/assets/0b37263e-1e36-4a31-a23e-c30e812c6b25" />
*Logged in user is **different** than merge user*


<img width="920" alt="image" src="https://github.com/user-attachments/assets/1e9803d2-3716-4398-b0d4-319455f23a8b" />
*Only 'Workzone' User has permissions*
