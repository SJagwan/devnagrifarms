export default ({ config }) => {
  const appEnv = process.env.APP_ENV || 'development';

  return {
    ...config,
    name: appEnv === 'production' ? 'Devnagri Farms' : `Devnagri (${appEnv})`,
    ios: {
      ...config.ios,
      bundleIdentifier: appEnv === 'production' 
        ? 'com.sjagwan.devnagrifarms' 
        : `com.sjagwan.devnagrifarms.${appEnv}`,
      infoPlist: {
        ...config.ios?.infoPlist,
        NSPhotoLibraryUsageDescription: "Allow Devnagri Farms to access your photos to upload profile pictures and product reviews.",
        NSCameraUsageDescription: "Allow Devnagri Farms to take photos for your profile picture.",
      }
    },
    android: {
      ...config.android,
      package: appEnv === 'production' 
        ? 'com.sjagwan.devnagrifarms' 
        : `com.sjagwan.devnagrifarms.${appEnv}`,
    },
    extra: {
      ...config.extra,
      appEnv,
    }
  };
};
