## 0.4.0

To be released: February 24, 2017
Theme: TBA

- [x] server: refactor local/remote uploads in tus, allow for pause/resume with remote upload (@arturi, @ifedapoolarewaju)
- [x] server: pass file size from Google Drive / Dropbox ? (@ifedapoolarewaju)
- [x] server: return uploaded file urls (from Google Drive / Dropbox) ? (@ifedapoolarewaju)

## 0.3.0

To be released: January 27, 2017.
Theme: The new 13: Responsive Dashboard, Standalone & Pluggable Server, Dropbox

- [x] server: a pluggable uppy-server (express / koa for now) (@ifedapoolarewaju)
- [x] server: standalone uppy-server (@ifedapoolarewaju)
- [x] server: Integrate dropbox plugin (@ifedapoolarewaju)
- [x] server: smooth authentication: after auth you are back in your app where you left, no page reloads (@ifedapoolarewaju)
- [x] tus: fix upload progress from uppy-server (@arturi, @ifedapoolarewaju)

## 0.2.0

To be released: November 25, 2016.
Theme: Responsive. Cancel. Feedback. ES6 Server

- [x] server: add pre-commit and lint-staged (@arturi)
- [x] server: re-do build setup: building at `deploy` and `prepublish` when typing `npm run release:patch` 0.0.1 -> 0.0.2 (@ifedapoolarewaju)
- [x] server: re-do build setup: es6 `src` -> es5 `lib` (use plugin packs from Uppy)
- [x] server: re-do build setup: `eslint --fix ./src` via http://standardjs.com (@ifedapoolarewaju)
- [x] server: re-do build setup: `babel-node` or `babel-require` could do realtime transpiling for development (how does that hook in with e.g. `nodemon`?) (@ifedapoolarewaju)
- [x] server: refacor: remove/reduce file redundancy (@ifedapoolarewaju)
- [x] server: error handling: 404 and 401 error handler (@ifedapoolarewaju)
- [x] server: bug fix: failing google drive (@ifedapoolarewaju)

Uppy-server's changelog is merged together with uppy client's changelog [here](https://github.com/transloadit/uppy/blob/master/CHANGELOG.md). Please check it out for a full reference.
