# 🔑 Overview

Project was created to deliver solid oauth functionality, which later on can be used as web-component <br><br>
Supported oauth services are

<ul style="list-style-type: disc;">
<li><b>Google</b></li>
<li><b>Facebook</b></li>
</ul>

## 👍 Prerequisities

You have to make sure, that you declared google-oauth script somwhere in your index.html file (on consumer side)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!--... Some tags ...-->
    <script src="https://accounts.google.com/gsi/client"></script>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

This google GSI script provides 'google' object, which is used by web component

```ts
// this needs to declared on consumer side, in place where user use <generic-auth> </generic-auth> components
declare const google: any;
```

## 🏃‍♂️ Getting started

### Local development

After

```sh
npm i
```

in the main directory, you can simply try build library (which is actually exposing GenericAuthComponent - core) with command:

```ssh
npm run build:generic-auth
```

and also:

```ssh
npm run build:generic-auth:styles
```

Above commands is necessary in order to apply TailwindCSS styles. <br>
GenericAuthComponent itself has isolated styles (is ShadowDom emulated), because this component will be build as a web component.

Next step is to execute command:

```sh
cd ./dist/generic-auth && npm pack && ren generic-auth-?.?.?.tgz generic-auth.tgz
```

And here we go - final **generic-auth.tgz** bundle can be copied and installed :)

After built process, to use web-component, user needs to update 'scripts' section in **angular.json** file

```json
{
  "projects": {
    "YOUR_PROJECT": {
      "projectType": "application",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/auth-app",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              }
            ],
            "styles": ["src/styles.scss"],
            "scripts": [
              {
                "input": "node_modules/generic-auth/generic-auth.mjs",
                "inject": false,
                "bundleName": "generic-auth"
              }
            ],
            }
        }
        }
        }
    }

    }
```

And then import that script within main **index.html** file

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Generic Auth App</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="auth-logo.ico" />
    <link rel="preconnect" href="https://lh3.googleusercontent.com" />
    <script src="https://accounts.google.com/gsi/client"></script>
    <script type="module" src="generic-auth.js"></script>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

More about usage you can find in Usage section

### External package

Generic-auth also is npm package published to npm. User can also installed it with command:

```bash
npm i generic-auth
```

## ⚙ Usage

Generic-Auth library can be imported as a 'library', or 'web component'

### Web Component

GenericAuthComponent expose output:

1. **(instanceInitialized$)** - hook called immediately after initialization of component. Has only one argument - authService. Shape of that argument is described below

```bash
export type AuthServiceMethods = {
  // possess logged user/access token
  loggedUserChanged$: BehaviorSubject<AuthUserProfile | undefined>;
  getLoggedUser(): AuthUserProfile | undefined;
  getAccessToken(): string | undefined;
  // perform logout action
  logout(): void;

  // set your own OAuthConfig
  setOAuthConfig(oauthConfig: OAuthConfig): void;
};

export type AuthUserProfile = Record<'email' | 'name' | 'id' | 'picture', string> &
  Record<'auth-type', AuthType>;

export type AuthType = 'facebook' | 'google' | 'jwt';

export type OAuthConfig = Partial<Record<AuthType, OAuthConfigPayload>>;
export type OAuthConfigPayload<T extends AuthType = 'facebook'> = T extends 'jwt'
  ? never
  : Record<AuthPayloadKeys, string>;

export type AuthPayloadKeys = 'clientId' | 'clientSecret' | 'redirectUri';
```

This hook can be used in order to get information about current logged in user/access token, or perform logout action/setting oauth config.

As you can see, OAuthConfig needs to be set by consumer side.

In order to assign config properly, I suggest to take advantage of "APP_INITIALIZER" injection token in **app.config.ts**:

```ts
export const appConfig: ApplicationConfig = {
    providers: [
    // ...all of needed providers
            {
      provide: APP_INITIALIZER,
      useFactory: (appRef: ApplicationRef) => async () => {
        const module = await import('../generic-auth.mjs' as any);

        const {genAuthService} = module.GenericAuthModule.getAuthProvider(appRef.injector);
        genAuthService.setOAuthConfig({
          facebook: facebookConfig,
          google: googleConfig,
        });
        if (isPlatformBrowser(appRef.injector.get(PLATFORM_ID))) {
          appRef.injector.get(AuthService).genAuthService = genAuthService;
          module.GenericAuthModule.generateWebComponent(appRef.injector);
        }
      },
      multi: true,
      deps: [ApplicationRef],
    },
    ]
}
```

Script with thankful name "**generic-auth.mjs**" is built version of library. It should indicates path from your **node_modules** folder.

> [!NOTE]  
> Right now jwt authorization is not be supported - it will be in the future.

### Library - coming soon

🚀 Deployment > ✨**Coming soon**✨

# 💻 Tech Stack

Used **frontend** technologies
| Dependency | Version |
| :---: | :---: |
| Angular | ^18.2.0 |
| Angular Elements | ^18.2.10 |
| RxJS | ~7.8.0 |
| TailwindCSS | ^3.4.14 |
