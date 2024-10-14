const fs = require("fs");
const path = require("path");
const { withAppBuildGradle } = require("@expo/config-plugins");

function copyKeystoreFile(config) {
  const keystoreSourcePath = path.resolve(__dirname, "./com.tiv.cp.keystore");
  const keystoreDestPath = path.resolve(
    config.modRequest.projectRoot,
    "android",
    "app",
    "com.tiv.cp.keystore"
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
            storeFile file('com.tiv.cp.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('com.tiv.cp.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
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
