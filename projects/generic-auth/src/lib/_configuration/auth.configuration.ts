// query-based authorization
// get is used to possess authorization token
type QueryBasedAuthorizationConfig = {
  getAccessTokenUrl: (
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ) => string;
  getProfileUrl: (accessToken?: string) => string;
};

// jwt based means authorization header will be present
// and post method will be used in order to possess access token
type JwtBasedAuthorizationConfig = {
  getAccessTokenUrl: () => string;
  getProfileUrl: () => string;
};

type FacebookAuthorizationCustomConfig = {
  getCheckAccessTokenValidationUrl: (cleintId: string, accessToken: string) => string;
};

type AuthorizationSourceConfig = {
  getRedirectUrl: (clientId: string, redirectUri: string) => string;
};

// workaround of CORS issues associated with github oauth
// in real-life scenario we prefer to use 'backend' to make authorization
// const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
export const facebookConfiguration: AuthorizationSourceConfig &
  QueryBasedAuthorizationConfig &
  FacebookAuthorizationCustomConfig = {
  getRedirectUrl: (clientId: string, redirectUri: string) =>
    `https://www.facebook.com/v13.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=email`,
  getAccessTokenUrl: (clientId: string, clientSecret: string, code: string, redirectUri: string) =>
    `https://graph.facebook.com/v13.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`,
  getProfileUrl: (accessToken?: string) =>
    `https://graph.facebook.com/v13.0/me?fields=id,name,email,picture&access_token=${accessToken}`,
  getCheckAccessTokenValidationUrl: (clientId: string, accessToken: string) =>
    `https://graph.facebook.com/oauth/access_token_info?client_id=${clientId}&access_token=${accessToken}`,
};

export const githubConfiguration: AuthorizationSourceConfig & JwtBasedAuthorizationConfig = {
  getRedirectUrl: (clientId: string, redirectUri: string) =>
    `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`,
  getAccessTokenUrl: () => `https://github.com/login/oauth/access_token`,
  getProfileUrl: () => `https://api.github.com/user`,
};
