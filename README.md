# Orbit Chrome extension

![screenshot](https://user-images.githubusercontent.com/2587348/82913428-926c2000-9f6e-11ea-9407-877f5e6bba31.png)

## Installation

Clone the repository and install the dependencies:

```bash
git clone git@github.com:orbit-love/orbit-browser-extension.git
yarn && yarn build
```

On Google Chrome:

1. Open [`chrome://extensions`](chrome://extensions);
2. Toggle the “developer mode” (_wink wink_) in the top-right corner;
3. Click on “Load unpacked”;
4. Select the `orbit-browser-extension/extension` folder;
5. An Orbit logo should appear in the top-right corner of Chrome indicating that the extension is active;
6. Right-click on this logo, then click on Options;
7. Fill in the form with your API key and workspace name (the extension uses the prod API by default), and save;
8. Go to a GitHub repository corresponding to your workspace settings, open an issue or a pull request and voilà!

## Development

Run `yarn start` to watch the changes.

To reload the extension after some changes, open [`chrome://extensions`](chrome://extensions) and click on the “reload” button for the Orbit one.

To use the local API instead of the prod one, change `ORBIT_API_ROOT_URL` in `orbit-helper.js` to your ngrok tunnel address.

## Deployment

TBD