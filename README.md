# Data-Class

Course site with 22 sessions, ready for GitHub Pages.

## Structure

```
Data-Class/
├── index.html              Home page with the session cards
├── assets/
│   ├── css/style.css       Shared styles for every page
│   ├── img/                Images, one folder per session
│   └── js/
│       ├── sessions.js     Session titles and descriptions (edit this)
│       ├── main.js         Builds the cards on the home page
│       ├── reader.js       Reading progress bar and contents highlight
│       └── session-NN.js   Interactive visuals for each session
└── sessions/
    ├── session-01.html
    ├── ...
    └── session-22.html
```

## Updating a session

1. In `assets/js/sessions.js`, set the session's `title` and `description`.
2. In `sessions/session-XX.html`, replace the heading and the content block.

## Publishing

Push to GitHub, then go to **Settings → Pages**, choose **Deploy from a branch**,
select `main` and `/ (root)`, and save.
