# minamp
it really whips the command line's ass

```
             __
  .--------.|__|.-----.---.-.--------.-----.
  |        ||  ||     |  _  |        |  _  |
  |__|__|__||__||__|__|___._|__|__|__|   __|
                                     |__|
```

Command line music player for Mac, uses VLC under the hood. Defaults to playing playlists from NightRide.fm. Can be configured to play any playlist though (local or remote).

This is an old personal project so lots of unfinished work once I got it working to my liking!

## Screenshots

### Absolute minimalist:
(Using [kitty](https://github.com/kovidgoyal/kitty)) <br/>
<img width="212" height="124" alt="Screenshot 2025-08-06 at 11 25 44 AM" src="https://github.com/user-attachments/assets/db1c7124-1170-413f-a431-fe8069a533d0" />

### More:
<img width="546" height="268" alt="image" src="https://github.com/user-attachments/assets/b26c66ca-fda6-43fe-8419-afcee92bb8b2" />
<br />
<img width="470" height="257" alt="image" src="https://github.com/user-attachments/assets/5b54efc5-1336-49a1-965d-e02de98829d3" />
<br />
<img width="293" height="199" alt="image" src="https://github.com/user-attachments/assets/937f80aa-cb22-4880-9839-ddf62444d832" />


Dependencies:

1. VLC (`brew install vlc`)
2. [Mise-en-place](https://mise.jdx.dev/getting-started.html) A tooling version manager (or nvm or fnm)   (`brew install mise`)

Install:

1. Install dependencies
2. `npm install`
3. `npm run start`

Controls:

| Key | Command          |
| --- | ---------------- |
| p   | Play / Pause     |
| ,   | Previous station |
| .   | Next station     |
| -   | Volume down      |
| +   | Volume up        |
| Esc | Quit             |
| 1,2,3... | Goto station |

## todo:

  1. [x] Play/pause indicator
  2. [x] Volume control
  3. Marquee artist / title
  4. Custom keybinds from .minamp-keys.json file
  5. Custom stations from .minamp-stations.json file
  6. Help dialog (show keybinds)
  7. More station options (label color, artist / title color)
  8. Custom global layouts (global padding, etc)
  9. Additional song meta-data search (year, URL, album, etc)
  10. Station browser (Window to browse local stations stored in .minamp-stations.json)
  11. Station discovery (via dir.xiph.org?)
  12. Stretch: Built-in visualizations?
