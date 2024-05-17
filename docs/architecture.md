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
- [x] add missing test cases
- [x] add support for displaying videos
- [x] make sure nothing loads multiple times on the page or on client side if it can be done on the server
	- This should be tested again once in a while
- [x] add a function to turn an image or video 90 degrees on client side
- [ ] add a function to turn an image or video 90 degrees on the server
- [ ] update the docs and the '../README.md' file.

### Media Status Metadata

Whenever the Media Sorting Server has to remember any Information about an image or video, a status object is updated with that Information. We defined a type 'MediaState', which is kept in sessionStorage, in files on the server and as state of the "useMediaStateServerSync" hook.

| Storage           | Purpose                                                         |
|-------------------|-----------------------------------------------------------------|
| Hook State        | update the UI in real-time                                      |
| JSON Server Files | keep state across clients                                       |
| sessionStorage    | to update UI across pages while cached page from server is used |

### Images

The original images from the server are used and the likely next images to be viewed are preloaded.

### Videos

The original video files on the server might not be optimized for streaming over a network. All though we might attempt to show the original file in some cases (when nothing better is available), all video files that become available to the server must be automatically optimized and stored in a version optimized for playback over a network.

For playback we will use a plain HTML5 Video-Tag, since that should offer all we need. We also evaluated [next-video](https://www.npmjs.com/package/next-video) but, since it is build to work with dedicated video hosting and optimization services, it would complicate the development of this media server. Thus we opt for the simple video-tags which should get the job done.

Currently implemented:
- [x] playback of original files from the server (which might take a while for loading)
- [ ] automatic playback of optimized versions if they are available
- [ ] file status overview menu, which shows if a video is currently being processed etc.
- [ ] automatic preparation of streaming video versions in the background on the server.
