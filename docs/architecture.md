# The Architecture of The Media-Sorting-Server

## Context Information

This project uses Next.js, which allows server side rendering of pages, as well as client-side operations, using Typescript. We use node.js within the server side code, to provide access to the media files on the server.

## How we provide access to the media files on the server

We use a layout.tsx to wrap our pages with a provider, which makes a list of files from the server, and possibly the state of these files available to the app (on client side). For example: If a video file got a request, to be turned by 90 degrees (if such a function is available), than the provider should store the state information, that the video has to be displayed rotated by 90 degrees, and that the server is currently processing a permanent change of the source file. When the new version of the file is available on the server, the state should be updated accordingly. The functions, which allow modification of the files on the server should also be part of this provider, along with the state.

The list below shows the planed and implemented functions:
- [x] create a file state provider in a layout.tsx
- [x] create a page using this layout, that will display the first file from the provided list.
- [x] create logic for going to the next image
- [x] create logic for going to the previous image
- [ ] add support for displaying videos
- [ ] make sure nothing loads multiple times on the page or on client side if it can be done on the server
- [ ] THING ABOUT SETTING UP TESTS AND CONTINUE TDD-STYLE IF POSSIBLE
- [ ] add a function to turn the image 90 degrees and trigger it via a page action
- [ ] add visual feedback for operations performing on media-files
- [ ] update the docs and the '../README.md' file.
