# Piped

[![AGPL v3](https://shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.en.html)
[![Matrix](https://img.shields.io/matrix/piped:matrix.org)](https://matrix.to/#/#piped:matrix.org)
[![Registered Users](https://pipedapi.kavin.rocks/registered/badge)](https://piped.video/register)
[![IPFS Build](https://github.com/TeamPiped/Piped/actions/workflows/ipfs-build.yml/badge.svg)](https://piped-ipfs.kavin.rocks/)
[![GitHub Repo stars](https://img.shields.io/github/stars/TeamPiped/Piped-Frontend?style=social)](https://github.com/TeamPiped/Piped/stargazers)
[![GitHub last commit](https://img.shields.io/github/last-commit/TeamPiped/Piped-Frontend)](https://github.com/TeamPiped/Piped/commits)
[![Translation status](https://hosted.weblate.org/widgets/piped/-/frontend/svg-badge.svg)](https://hosted.weblate.org/projects/piped/frontend/)

An open-source alternative frontend for YouTube which is efficient by design.

# The Problem

YouTube has an extremely invasive privacy policy which relies on using user data in unethical ways. You give them a lot of data - ranging from ideas, music taste, content, political opinions, and much more than you think.

By using Piped, you can freely watch and listen to content without the fear of prying eyes watching everything you are doing.

## Features:

**User Features**

-   [x] No Ads
-   [x] No Tracking
-   [x] Lightweight on server and client
-   [x] Infinite Scrolling
-   [x] Light/Dark themes
-   [x] Login
-   [x] Feeds
-   [x] Playlists
-   [x] Integration with [SponsorBlock](https://github.com/ajayyy/SponsorBlock)
-   [x] Integration with [LBRY](https://lbry.com/) for streaming
-   [x] Integration with [Return YouTube Dislike](https://returnyoutubedislike.com/) via [RYD-Proxy](https://github.com/TeamPiped/RYD-Proxy)
-   [x] 4K support
-   [x] No connections to Google's servers
-   [x] Playing just audio
-   [x] PWA support
-   [x] Locally saved Preferences
-   [x] [Available in many languages](src/locales), thanks to [our translators](https://hosted.weblate.org/projects/piped/frontend/)
-   [x] Embedded video support
-   [x] No age restriction
-   [x] Bypasses Geo restrictions if possible through a federated network

**Technical Features**

-   [x] Multi-region load-balancing
-   [x] Performant by design, designed to handle 1000s of users concurrently
-   [x] Does not use official YouTube APIs
-   [x] Uses [NewPipeExtractor](https://github.com/TeamNewPipe/NewPipeExtractor) to extract information
-   [x] Public [JSON API](https://docs.piped.video/docs/api-documentation/)
-   [x] Federated protocol on Matrix to let instances collaborate with each other

## Screenshots

| Player                                                                                                        | Trending                                                                                                      | Channel                                                                                                       |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ![Screenshot 1](https://cloudflare-ipfs.com/ipfs/bafybeiaxhsog7jzydr7xb3xhlemxilqksceqg5fraaiuojzclhocsqrcvq) | ![Screenshot 2](https://cloudflare-ipfs.com/ipfs/bafybeigafumvrgbfyufxjptvufobstrywrfv2kteyuuictfko6kvghjszu) | ![Screenshot 3](https://cloudflare-ipfs.com/ipfs/bafybeiehs5xjqmmq34gmewxoqm3j3b2ze3pve4sdmanz7ukrxwgrcmxnry) |

## Public Chat Rooms

-   You can join us via Matrix at [#piped](https://matrix.to/#/#piped:matrix.org).
-   You can also join us at the libera.chat IRC network which is bridged to the Matrix room at [#piped](https://web.libera.chat/#piped).

## Self-Hosting

See https://docs.piped.video/docs/self-hosting/ for more details.

The source code of the documentation website is available at https://github.com/TeamPiped/Documentation.

## Documentation

The documentation can be found at https://docs.piped.video (accessible via IPNS as well).

## Extensions

To redirect all YouTube links to Piped, you are highly recommended to use either [Piped-Redirects](https://github.com/TeamPiped/Piped-Redirects) or [Libredirect](https://github.com/libredirect/libredirect#readme).

## Contributing

### Translations

You can help by translating the project to a language you speak at https://hosted.weblate.org/projects/piped/frontend/

### Mirrors

-   Cloudflare Pages - [cf.piped.video](https://cf.piped.video/)
-   Vercel - [vc.piped.video](https://vc.piped.video/)
-   Render - [re.piped.video](https://re.piped.video/)
-   Fleek - [fl.piped.video](https://fl.piped.video/)
-   DigitalOcean - [do.piped.video](https://do.piped.video/)
-   Netlify - [nf.piped.video](https://nf.piped.video/)
-   Azure - [az.piped.video](https://az.piped.video/)

### Forking, and contributing

-   Fork the repository on GitHub: https://github.com/TeamPiped/Piped/fork
-   Create your feature branch: `git checkout -b my-awesome-feature`
-   Stage your files `git add .`
-   Commit your changes `git commit -am 'Add awesome new feature'`
-   Push to the branch `git push origin my-awesome-feature`
-   Create a new pull request: https://github.com/TeamPiped/Piped/compare

### Development Setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

You can now make changes and view then in realtime!

## Contact

If you would like to contact me personally, you may do so with the following means:

-   Matrix: @kavin1337:matrix.org
-   Mastodon: https://mastodon.online/@kavin
-   Email: kavin@kavin.rocks

## Donations

Donations can be made at:

-   bc1qhq8zjxmu405nvp37njj6zv3s980zg400pu9jfe (BTC)
-   0x1D77D4cfB1a947514241bcf19B1F04738495e2fD (ETH)
-   8A5Up8rKgagVAz6TuUduBqHp518H1U6fYc6GqCfWsaEfjGzbSccfYpgMqp5d4oe5Ws5MuFE1iKmhQTadhMhvuk3bHRT5Ebk (XMR, aka Monero)
-   nano_1ngejzydncche4rdua3iebhj7sa95pw5geq4pb8phugtjf3tku933ktjb4pq (Nano)
-   XpzgouDTKCUuE8a92XqjX9b43gKL8oLihw (Dash)

FIAT donations can be made at: https://liberapay.com/kavin

Contributions in any other form are also welcomed.

# Made with Piped

-   [Yattee](https://github.com/yattee/yattee) - an alternative frontend for YouTube, for IOS.
-   [LibreTube](https://github.com/Libre-tube/LibreTube) - an alternative frontend for YouTube, for Android.
-   [Hyperpipe](https://codeberg.org/Hyperpipe/Hyperpipe) - an alternative privacy respecting frontend for YouTube Music.

## YourKit

![](https://www.yourkit.com/images/yklogo.png)

YourKit has given an open source license for their profiler, greatly simplifying the profiling of Piped's performance.

YourKit supports open source projects with its full-featured Java Profiler.
YourKit, LLC is the creator of [YourKit Java Profiler](https://www.yourkit.com/java/profiler/)
and [YourKit .NET Profiler](https://www.yourkit.com/.net/profiler/),
innovative and intelligent tools for profiling Java and .NET applications.
