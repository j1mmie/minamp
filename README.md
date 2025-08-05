# minamp
it really whips the command line's ass

```
             __
  .--------.|__|.-----.---.-.--------.-----.
  |        ||  ||     |  _  |        |  _  |
  |__|__|__||__||__|__|___._|__|__|__|   __|
                                     |__|
```

Command line music player for Mac, uses VLC and NightRide.fm under the hood.

<img width="546" height="268" alt="image" src="https://github.com/user-attachments/assets/b26c66ca-fda6-43fe-8419-afcee92bb8b2" />

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
| ,   | Previous Station |
| .   | Next Station     |
| p   | Play / Pause     |

## todo:

  1. Play/pause indicator
  2. Volume control
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

## textgrabs:

```

     ,___       _  _
    /   //  o  // //                _/_ /
   /    /_ ,  // // (   __  , _ _   /  /_
  (___// /_(_(/_(/_/_)_/ (_/_/ / /_(__/ /_
                          /
  Artist:  L'Avenue
  Title:   Sun and the Moon (instrumental)

```

```
  __________        __      __
  \______   \ ____ |  | ___/  |_
   |       _// __ \|  |/ /\   __\
   |    |   \  ___/|    <  |  |
   |____|_  /\___  >__|_ \ |__|
          \/     \/     \/

  Artist:  High Performance
  Title:   Escape With Me Feat. CJ Neon

```

```

  _  _ _ ____ _  _ ___ ____ _ ___  ____
  |\ | | | __ |__|  |  |__/ | |  \ |___
  | \| | |__] |  |  |  |  \ | |__/ |___

  Artist:  MoTER
  Title:   JEt

```
