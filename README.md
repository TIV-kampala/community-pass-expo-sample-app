A sample Expo app leveraging the New Community Pass Unified API and Bridge RA 🚀

## Table of Contents

- [About this sample app](#about-this-sample-app)
- [Setting up a new project](#new-project)

## About this sample app <a name="about-this-sample-app"></a>

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). It uses the [Expo IntentLauncher](https://docs.expo.dev/versions/latest/sdk/intent-launcher/) to send intents to the Bridge RA. It also uses [this library](https://github.com/TIV-kampala/compass-expo-android-utils/tree/main) which exposes some utility methods to assist with encryption and decryption of brigde RA requests and responses. You can take a look at [./app/index.tsx](./app/index.tsx) and [./utils/compass-helper.ts](./utils/compass-helper.ts) to see how pieces are put together.

For a bare react-native workflow, [take a look at this instead](https://github.com/TIV-kampala/community-pass-react-native-sample-app#)

## Setting up a new project <a name="new-project"></a>
1. Set up and Install the Bridge Reliant App. [Refer to this resource](https://developer.mastercard.com/cp-kernel-integration-api/tutorial/bridge-ra-getting-started-guide/).
2. Bootstrap a new Expo project
- Follow [this guide](https://www.npmjs.com/package/create-expo-app) to setup a new expo project.
3. Create a `plugins` folder at the root of your project and create a file `withCustomKeyStore.js` under it.
Copy and paste below content to `withCustomKeyStore.js` and replace the keystore credentials with the keystore you used to sign your bridge RA.
```js
const fs = require("fs");
const path = require("path");
const { withAppBuildGradle } = require("@expo/config-plugins");

function copyKeystoreFile(config) {
  const keystoreSourcePath = path.resolve(__dirname, "replace with path to your keystore file");
  const keystoreDestPath = path.resolve(
    config.modRequest.projectRoot,
    "android",
    "app",
    "replace with your keystore file name"
  );

  if (fs.existsSync(keystoreSourcePath)) {
    fs.copyFileSync(keystoreSourcePath, keystoreDestPath);
    console.log("Keystore file copied successfully.");
  } else {
    console.warn(`Keystore file not found at ${keystoreSourcePath}`);
  }
}

const signingConfig = `
    signingConfigs {
        debug {
            storeFile file('replace with your keystore file name')
            storePassword 'replace with your keystore password'
            keyAlias 'replace with your keystore alias'
            keyPassword 'replace with your key password'
        }
        release {
            storeFile file('replace with your keystore file name')
            storePassword 'replace with your keystore password'
            keyAlias 'replace with your keystore alias'
            keyPassword 'replace with your key password'
        }
    }
`;

function withCustomKeystore(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      // Copy the keystore file
      copyKeystoreFile(config);
      // Check if signingConfigs already exists in the file
      if (!/signingConfigs\s*{/.test(config.modResults.contents)) {
        // Modify the app/build.gradle file to add the signing configs if not present
        config.modResults.contents = config.modResults.contents.replace(
          /android\s?{/,
          `android {\n${signingConfig}`
        );
      } else {
        // Update existing signingConfigs if present
        config.modResults.contents = config.modResults.contents.replace(
          /signingConfigs\s*{[^{}]*{[^{}]*}[^}]*}/,
          signingConfig.trim()
        );
      }
    }
    return config;
  });
}

module.exports = withCustomKeystore;

```
4. Add `./plugins/withCustomKeyStore.js` plugin to the plugins in `app.json`
```
"plugins": [
   ...
      "./plugins/withCustomKeyStore.js"
    ],
```
5. Install [Expo IntentLauncher](https://docs.expo.dev/versions/latest/sdk/intent-launcher/) and [compass-expo-android-utils](https://github.com/TIV-kampala/compass-expo-android-utils/tree/main).
- Expo Intent launcher will be used to send intents to the bridgeRA.
- compass-expo-android-utils will assist in encrypting and decrypting requests and responses to and from the Bridge RA.
```sh
npx install-expo-modules@latest && npx expo install expo-intent-launcher && npm i git+https://github.com/TIV-kampala/compass-expo-android-utils.git
```
6. Copy and paste [./utils folder](./utils), [./components/community-pass/index.tsx component](./components/community-pass/index.tsx) and use them as a guide to start building out your usecases.

# Recomendations

- If the Reliant app has both Credential manager and Acceptor use cases, make sure to pass different `participationProgramId` or `programGuid` accordingly.
- Use a secure/encrypted local data store for the data you need to store on the device. We recommend [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- Always refer to [The official community pass documentation](https://developer.mastercard.com/cp-kernel-integration-api/tutorial/bridge-ra-getting-started-guide/) for the most recent and accurate information.