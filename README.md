# Currently in development

## TODOs until this is useful:
- [x] Displaying pictures from a server directory in full-screen
- [x] Allowing navigation between pictures via arrow keys
- [x] Allow navigation via next links and enable caching of next (and previous) images
- [ ] Displaying videos from a server directory in full-screen
- [ ] Permanently move image or video file into a trash directory on the server on key press
- [ ] Permanently move image or video file into a (new) named directory on the server on key press
- [ ] Allow the configuration of shortcut keys to move a file to configured directories
- [ ] Create mobile UI
- [ ] handle issues with case sensitive file names

Also see the checklist in the [Architecture Notes](./docs/architecture.md)

The checked features have already been implemented and once this checklist is completed more features may follow (e.g. gallery overview).


# media-sorting-server
Host this project on your intranet-home-server if you want to sort pictures (and videos) into new directories on your server via an easy to use web-frontend, which allows you to view your pictures in full-screen, while you are sorting them.

# Development Hints

The project assumes that you have image files in the "./public" directory within you project locally.

This is a Next.js app, to start developing interactively run the dev-server via:
```bash
npm run dev
```

When checking for server-side vs. client-side execution and casching etc. build and run the application:
```bash
npm run build
npm run start
```
