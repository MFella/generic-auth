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
GenericAuthComponent itself has isolated styles (is ShadowDom emulated), because - later on - this component will be build as a web component.
After built process, to use web-component, user needs to register it with

```ts
bootstrapApplication(AppComponent, appConfig)
  .then((platform) => {
    GenericAuthModule.generateWebComponent(platform.injector);
  })
  .catch((err) => console.error(err));
```

Over there GenericAuthModule will generate web component after bootstrap of application.

✨**Coming soon**✨ > Publication of web-component

## ⚙ Usage

GenericAuthComponent exposed outputs:

1. **(instanceInitialized$)** - hook called immediately after initialization of component. Has only one argument - authService. Shape of that argument is described below

```bash
export type AuthServiceMethods = {
  // possess logged user/access token
  loggedUserChanged$: BehaviorSubject<AuthUserProfile | undefined>;
  getLoggedUser(): AuthUserProfile | undefined;
  getAccessToken(): string | undefined;
  // perform logout action
  logout(): void;
};

export type AuthUserProfile = Record<'email' | 'name' | 'id' | 'picture', string> &
  Record<'auth-type', AuthType>;

export type AuthType = 'facebook' | 'google' | 'jwt';
```

This hook can be used in order to get information about current logged in user/access token, or perform logout action.

> [!NOTE]  
> Right now jwt authorization is not be supported - it will be in the future.

🚀 Deployment > ✨**Coming soon**✨

# 💻 Tech Stack

Used **frontend** technologies
| Dependency | Version |
| :---: | :---: |
| Angular | ^18.2.0 |
| Angular Elements | ^18.2.10 |
| RxJS | ~7.8.0 |
| TailwindCSS | ^3.4.14 |
