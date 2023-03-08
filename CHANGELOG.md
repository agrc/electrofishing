# Changelog

## [2.1.0-2](https://github.com/agrc/electrofishing/compare/v2.1.0-1...v2.1.0-2) (2023-03-08)


### 🐛 Bug Fixes

* cache domain dropdown requests ([5388608](https://github.com/agrc/electrofishing/commit/53886086a6585b1dd76f4a6724a1477e2333e238))
* if there is an issue with the refresh token, log out the user ([0ea823d](https://github.com/agrc/electrofishing/commit/0ea823de027d56fd6f5adbec4d68febfda851f55))
* if there's an issue with auth token, log out the user and refresh ([1a3c76e](https://github.com/agrc/electrofishing/commit/1a3c76eb9e049b9ee63ca4c5b88a4aa9662af44e))
* keep combobox empty on tab ([b6268bd](https://github.com/agrc/electrofishing/commit/b6268bd3e4d3c5ccff431d6cee2cd712dc737362))
* React-ify Catch tab ([fe66a16](https://github.com/agrc/electrofishing/commit/fe66a16199091cbdf6e82f260ff6672ef3daf5ee))
* select combox value on tab press ([3f21abe](https://github.com/agrc/electrofishing/commit/3f21abe326d64a0512c6e702c098f41abdecdd95))

## [2.1.0-1](https://github.com/agrc/electrofishing/compare/v2.1.0-0...v2.1.0-1) (2023-02-27)


### 🐛 Bug Fixes

* add release please manifest ([ffc453a](https://github.com/agrc/electrofishing/commit/ffc453a1c98c5305efeef7b20748b451b99e1b05))
* prevent multiple submits ([d9ecd3d](https://github.com/agrc/electrofishing/commit/d9ecd3dfc3bab61d303b2ee8a4631402e8b8259e))
* switch to extra-files action param ([379ba31](https://github.com/agrc/electrofishing/commit/379ba316b25fc9a4d960a6d8fe0cabae78e042a3))
* update changelog link to point to gh releases ([b457ceb](https://github.com/agrc/electrofishing/commit/b457ceb8ea028c2227faef8f14b835ff8d4b7b7e))

## [2.1.0-0](https://github.com/agrc/electrofishing/compare/v2.0.1-1...v2.1.0-0) (2023-02-27)


### 🎨 Design Improvements

* center login button ([6699158](https://github.com/agrc/electrofishing/commit/669915838419024e66836ff357301d6f411626f6))
* make station input larger and standardize style ([5500ce6](https://github.com/agrc/electrofishing/commit/5500ce6e1cc7e020558de1adc5fb97609853056d))


### 🚀 Features

* add additional stats to summary report before submission ([a6fbb96](https://github.com/agrc/electrofishing/commit/a6fbb96b63ef91613c87c4c386df4fab1e770a60)), closes [#69](https://github.com/agrc/electrofishing/issues/69) [#77](https://github.com/agrc/electrofishing/issues/77)


### 🐛 Bug Fixes

* AGRC -&gt; UGRC ([09c4c2b](https://github.com/agrc/electrofishing/commit/09c4c2b529034090dea357fdfe902acf1bb97e06))
* better layout for auth controls ([7f1b13f](https://github.com/agrc/electrofishing/commit/7f1b13ffdbe104950fab99b979c2795932036e64))
* better spacing for add station button ([9c3d306](https://github.com/agrc/electrofishing/commit/9c3d3063ee56e40cf4783d7935e51e8e96a71fbd))
* build ([0aa5f5a](https://github.com/agrc/electrofishing/commit/0aa5f5a60129b5cdf9affd018520e01d83c7c88f))
* bump local forage ([d031467](https://github.com/agrc/electrofishing/commit/d03146716ea3591b9e5e74f63349ca6ceb8f64c8))
* clean up old styles ([0a10dbc](https://github.com/agrc/electrofishing/commit/0a10dbc9c6eae9bfae0dfa3cdaa8d7edce36dc14))
* convert token expire to ticks ([3d1b807](https://github.com/agrc/electrofishing/commit/3d1b807bcdb9f381108a0cf18beb90bc2b370711))
* disable token refresh in cypress tests ([eadcff2](https://github.com/agrc/electrofishing/commit/eadcff2947469d0626517660a02ca46ef2c3d6be))
* env vars for build step ([03d01b1](https://github.com/agrc/electrofishing/commit/03d01b1861c80d4e977e93fb9eb2489a7145bc3c))
* fix clsx in dojo build ([8c3ab71](https://github.com/agrc/electrofishing/commit/8c3ab711e1b93d996f12f14169748a1354c7ca65))
* fix map reference ([7941069](https://github.com/agrc/electrofishing/commit/7941069b94989b28966c9e248cd9939d561dad1e))
* get id token directly in service worker ([19916f4](https://github.com/agrc/electrofishing/commit/19916f4d7c8e3577d96484ae43e0648ddc380766))
* get storybook up and running again ([3b9a2ba](https://github.com/agrc/electrofishing/commit/3b9a2ba69b0ad3b5d74daca44fdb12bf24db094d))
* linting ([7d04270](https://github.com/agrc/electrofishing/commit/7d04270eb46d57cbb0f5b9c3cb35a29d409f6d0a))
* make sure that newly created station is selected in main map ([65d1737](https://github.com/agrc/electrofishing/commit/65d1737673d528b7204bde73d500e05f6feba63f))
* move auth closer to deploy ([08dacb1](https://github.com/agrc/electrofishing/commit/08dacb10154dc0da1e1ad0cd9099df3aeb84cf1d))
* persist login between sessions ([2dd22e8](https://github.com/agrc/electrofishing/commit/2dd22e8b5bd8d2a1ba42becd2632169f8b5badaa))
* prevent summary report dialog from flashing on load ([02a3100](https://github.com/agrc/electrofishing/commit/02a31009a5e2901f9a5ba3af1dcb96b498688c23))
* put service worker back in build command ([025f587](https://github.com/agrc/electrofishing/commit/025f5878eafb584646d653a098eb26c76518c268))
* reactify Method tab and equipment component ([88dd512](https://github.com/agrc/electrofishing/commit/88dd512f61bf55e690099eeb9728caec067867ee))
* remove prop type declaration that dojo build didn't like ([5d856a7](https://github.com/agrc/electrofishing/commit/5d856a7f130d0e2164126e0b00a559fd6e72c480))
* restore dojo version of OtherOptionHandler ([54e1808](https://github.com/agrc/electrofishing/commit/54e18081b1ca1da8e266b4031ed02fd17da3e457))
* setTimeout -&gt; setInterval typo ([635cf37](https://github.com/agrc/electrofishing/commit/635cf37a7f41b91449df4975fe48421087315570))
* switch to set interval for token refresh ([4cddf19](https://github.com/agrc/electrofishing/commit/4cddf19e08a9fe01b6bf2b884d2abdf3d4da6f5e))
* switch to sign in with popup ([6e60a75](https://github.com/agrc/electrofishing/commit/6e60a752b7fb452bbb56a6957bc92a960d2473ca))
* try login button ([d734514](https://github.com/agrc/electrofishing/commit/d7345142376b814cda74ce8b060c1de36ff4abf0))
* upgrade cypress tests to match new react components ([ce13f2a](https://github.com/agrc/electrofishing/commit/ce13f2a2d1ab8710d11f6289697474cec3e7385f))
* upgrade firebase-tools ([1c3f784](https://github.com/agrc/electrofishing/commit/1c3f78473f0d4469dd193a3e0d50119d14049297))
* use latest version of firebase-tools for deploy ([fa0e7e0](https://github.com/agrc/electrofishing/commit/fa0e7e09ccfeb27b584127b32eb0df386d44ead5))
* use redirect auth flow for cypress ([a0126e9](https://github.com/agrc/electrofishing/commit/a0126e991466c060d90239e7f8a1eb17a69cc255))
