<center><img src="icons/icon128.png"></img></center>

# RippleFX

Add splashy ripples to every click.

**RippleFX** is a browser extension that takes every boring click on every webpage and turns it into a tiny explosion of visual satisfaction. You know those moments where you click a button and nothing happens except… you now know you clicked it? This fixes that.

This is exactly the kind of thing you install *on a whim* and forget about until you’re clicking around your inbox like it’s a touch-screen fish pond.

---

## What It Does

Whenever you click *anything* on a webpage (yes, everything), RippleFX injects a quick ripple effect right under your pointer. It’s lightweight, it’s delightful, and it does not ask for permission to make your day a little better.

* Adds a clean ripple animation on all click events
* Works on arbitrary web pages (not limited to your grandma’s blog)
* Zero server calls, zero spying — strictly visual goodness
* Fast enough to not make you regret installing it

If you want to make every website feel like a Zen garden after a raindrop festival, this is your jam.

---

## Install

Grab the extension file for your favorite browser:

* ripplefx-chrome.zip — Google Chrome
* ripplefx-edge.zip — Microsoft Edge
* ripplefx-firefox.zip — Mozilla Firefox

Just unzip, load as an unpacked extension in your browser’s extensions page, and let the splashing begin.

---

## Build & Develop

This repo uses a straightforward JavaScript build process.

To get set up locally:

1. Clone the repo

   ```bash
   git clone https://github.com/limpdev/ripplefx.git
   ```
2. Install dependencies

   ```bash
   yarn
   ```
3. Build

   ```bash
   yarn build
   ```
4. Load the unpacked extension from `dist-chrome`, `dist-edge`, or `dist-firefox` into your browser of choice.

If you want to tweak animations, timing, or add themes (dark ripples? acid ripples? make it so), go for it. Pull requests gladly accepted.

---

## How It Works (Nerd Version)

RippleFX listens for the browser’s click events and spawns a ripple animation at the click location. It does this with straightforward DOM insertion and CSS animations — no frameworks, no heavy lifting.

This means it runs fast and doesn’t bloat pages you care about. The effect is ephemeral, pretty, and disappears once its work is done.

---

## Configuration

Out of the box there’s no heavy config. It *just works*. If you want to adjust:

* ripple color
* scale
* duration

…you can do that in the CSS or animation config inside the extension scripts.

---

## Privacy & Permissions

RippleFX requests only the minimal permissions necessary to inject script into pages for visuals. It does not collect, store, or transmit any data. All my homies hate that stuff.

---

## Issues & Contributing

Got a bug? Want a feature? Think the ripple should produce sound too? File an issue or a pull request.

We’re happy to take a look... maybe. Again this is not a very serious project (did I mention this is MIT licensed?)

## License

RippleFX is MIT licensed (oh, there it is). Meaning: you can use it, remix it, and make your own splashy fork without asking permission.

## Final Note

If you ever feel like the web is too dry, just install this and click around for 60 seconds. You’ll get it.

