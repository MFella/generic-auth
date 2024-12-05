import {AuthType, AuthUserProfile} from './auth.types';

export type ValidLSKeys = 'access_token' | 'user';

export type LSEntryMap = {
  'access_token': string;
  'user': AuthUserProfile;
  'auth-type': AuthType;
};
