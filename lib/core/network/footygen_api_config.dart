abstract final class FootygenApiConfig {
  static const websiteUrl = 'https://www.footygen.online';
  static const baseUrl = String.fromEnvironment(
    'FOOTYGEN_API_BASE_URL',
    defaultValue: websiteUrl,
  );
  static Uri get origin => Uri.parse(baseUrl);
  static Uri get websiteOrigin => Uri.parse(websiteUrl);
  static const authRedirect = 'com.footballgenius.footygen://login-callback/';
}
