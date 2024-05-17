# Tests

To run all tests use `npm run qa`. Please be aware that some features may need manual testing.

The table below lists the page behavious we want to ensure. Unit-tests are not listed below.

| Feature                                                    | Tests                        |
|------------------------------------------------------------|------------------------------|
| Shortcuts to navigate images                               | e2e/file-pages.spec.ts       |
| Link-Buttons to navigate images                            | e2e/file-pages.spec.ts       |
| Preload next and previous image I may navigate to.         | MANUAL TESTING               |
| Shortcuts to toggle full-screen                            | MANUAL TESTING               |
| Different views depending on file type image, video, other | MANUAL TESTING / TODO        |
| Video control shortcuts                                    | MANUAL TESTING / TODO        |
| Marking images and videos as favorites                     | MANUAL TESTING / TODO        |
| Like and unlike on client and server                       | e2e/like.spec.ts             |
| Like and unlike (from multiple tabs/browsers)              | MANUAL TESTING / TODO        |
| Sorting files into categories                              | MANUAL TESTING / TODO        |
| Navigation between categories, sorting view and overview   | MANUAL TESTING / TODO        |
