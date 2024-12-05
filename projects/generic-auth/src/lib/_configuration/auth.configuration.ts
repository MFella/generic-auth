type FacebookAuthorizationCustomConfig = {
  getAccessTokenUrl: (
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ) => string;
  getProfileUrl: (accessToken: string) => string;
  getCheckAccessTokenValidationUrl: (cleintId: string, accessToken: string) => string;
};

type AuthorizationSourceConfig = {
  getRedirectUrl: (clientId: string, redirectUri: string) => string;
};

export const facebookConfiguration: AuthorizationSourceConfig & FacebookAuthorizationCustomConfig =
  {
    getRedirectUrl: (clientId: string, redirectUri: string) =>
      `https://www.facebook.com/v13.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=email`,
    getAccessTokenUrl: (
      clientId: string,
      clientSecret: string,
      code: string,
      redirectUri: string
    ) =>
      `https://graph.facebook.com/v13.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`,
    getProfileUrl: (accessToken: string) =>
      `https://graph.facebook.com/v13.0/me?fields=id,name,email,picture&access_token=${accessToken}`,
    getCheckAccessTokenValidationUrl: (clientId: string, accessToken: string) =>
      `https://graph.facebook.com/oauth/access_token_info?client_id=${clientId}&access_token=${accessToken}`,
  };

// export const googleConfiguration: AuthorizationSourceConfig = {
//     getRedirectUrl: ()
// };
