# The Architecture of The Media-Sorting-Server

## Context Information

This project uses Next.js, which allows server side rendering of pages, as well as client-side operations, using Typescript. We use node.js within the server side code, to provide access to the media files on the server.

## How we provide access to the media files on the server

We use next-js server actions to make the file state (and actions on files) on the server available to the client side. For example: If a video file got a request, to be turned by 90 degrees (if such a function is available), than we would just call a server action for that, while possibly doing preview changes (turning of the loaded video via HTML/CSS) on the client side until the changes are done on the server. When the new version of the file is available on the server, the state should be updated accordingly. 

The list below shows the planed and implemented functions:
- [x] create server actions to provide file state info.
- [x] create a page that will display the images.
- [x] create logic for going to the next image
- [x] create logic for going to the previous image
- [x] setup e2e tests
- [x] qa command for quality assurance in package.json
- [x] setup a unit tests and add them to the qa command
- [ ] add missing test cases
- [ ] add support for displaying videos
- [ ] make sure nothing loads multiple times on the page or on client side if it can be done on the server
- [ ] add a function to turn the image 90 degrees and trigger it via a page action
- [ ] add visual feedback for operations performing on media-files
- [ ] update the docs and the '../README.md' file.
