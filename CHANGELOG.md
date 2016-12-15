Our combined changelog and roadmap. It contains todos as well as dones.

Items can be optionally be tagged tagged by GitHub owner issue if discussion
happened / is needed.

Please add your entries in this format:

we're `<1.0.0` and allowing ourselves to make breaking changes in minor
and patch levels.

## Backlog

Ideas that will be planned and find their way into a release at one point

- [ ] Deploy on Lambda via Apex
- [x] Steal locutus' Travis deploy method. Currently fatals still deploy.

## 0.2.0

- [x] server: re-do build setup: building at `deploy` and `prepublish` when typing `npm run release:patch` 0.0.1 -> 0.0.2 (@ifedapoolarewaju)
- [x] server: re-do build setup: es6 `src` -> es5 `lib` (use plugin packs from Uppy)
- [x] server: re-do build setup: `eslint --fix ./src` via http://standardjs.com (@ifedapoolarewaju)
- [x] server: re-do build setup: `babel-node` or `babel-require` could do realtime transpiling for development (how does that hook in with e.g. `nodemon`?) (@ifedapoolarewaju)
- [x] server: refacor: remove/reduce file redundancy (@ifedapoolarewaju)
- [x] server: error handling: 404 and 401 error handler (@ifedapoolarewaju)

## 0.0.7

- [x] Better version of: Make `env.sh` not being available non-fatal

## 0.0.6

- [x] Make `env.sh` not being available non-fatal

## 0.0.5

- [x] Deal with corrupted files being saved

## 0.0.4

Scheduled to be released: April 13, 2016

- [x] Add `npm run logtail` script (@kvz)

## 0.0.1

Released: February 16, 2016

- [x] First swing at uppy-server (@hedgerh)
