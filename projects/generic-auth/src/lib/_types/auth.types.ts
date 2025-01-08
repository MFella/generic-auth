export type AuthUserProfile = Record<'email' | 'name' | 'id' | 'picture', string> &
  Record<'auth-type', AuthType>;

export type FacebookUserProfile = Omit<AuthUserProfile, 'picture'> &
  Record<'picture', FacebookPicture>;
export type GithubUserProfile = Omit<AuthUserProfile, 'picture'> & Record<'avatar_url', string>;
export type OAuthType = 'facebook' | 'google' | 'github';
export type AuthType = OAuthType | 'jwt';

export type JwtConfig = {
  endpoint_url: string;
  user_profile_path: string;
  revoke_token_path?: string;
  refresh_token_path?: string;
};

export type OAuthConfig = Partial<Record<OAuthType, OAuthConfigPayload>>;
export type OAuthConfigPayload<T extends AuthType = 'facebook'> = T extends 'jwt'
  ? never
  : Record<AuthPayloadKeys, string>;

export type AuthPayloadKeys = 'client_id' | 'client_secret' | 'redirect_uri';

export type FacebookAccessTokenValidationPayload = {
  expires_in: number;
  access_token: string;
  token_type: string;
};

export type GoogleJwtPayload = {
  picture: string;
  name: string;
  email: string;
  exp: number;
  sub: string;
};

export type GoogleAuthRawPayload = {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: string;
};

type FacebookPicture = {
  data: {
    height: number;
    is_silhouette: boolean;
    url: string;
    width: 50;
  };
};
