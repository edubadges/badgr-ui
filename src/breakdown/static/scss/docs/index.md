# Pattern Library

This pattern library is built using [Fractal](http://fractal.build). The underlying concepts are based on [SMACSS](https://smacss.com).

## Base Rules

Base rules can be found in `screen.scss`. These are applied globally to the entire project. Additionally, variables that are used throughout the project can be found in `_base.scss` and are outlined below.

## Layout Rules

Layout rules are individual patterns that wrap module rules and determine how pages are laid out.

## Module Rules

Module rules are the individual patterns (components, modules, etc) that make up the aesthetic portions of user interface.

<hr>

# Base Rules

Below are the base values (variables) that are used through the user interface.

## Colors

Variable Name | Value
------------- | -----
`$color-primary` | <p style="background: #c30a28; color: #fff; padding: 1em; border-radius: 3px;">`#c30a28`</p>
`$color--primary-light` | <p style="background: #f7e1e5; color: #000; padding: 1em; border-radius: 3px;">`#f7e1e5`</p>
`$color-secondary` | <p style="background: #05012c; color: #fff; padding: 1em; border-radius: 3px;">`#05012c`</p>
`$$color-tertiary` | <p style="background: #ffb500; color: #fff; padding: 1em; border-radius: 3px;">`#ffb500`</p>
`$color-quaternary` | <p style="background: #93ab23; color: #fff; padding: 1em; border-radius: 3px;">`#93ab23`</p>
`$color-light1` | <p style="background: #fff; color: #000; padding: 1em; border-radius: 3px;">`#fff`</p>
`$color-light2` | <p style="background: #fcfcfc; color: #000; padding: 1em; border-radius: 3px;">`#fcfcfc`</p>
`$color-light3` | <p style="background: #f7f7f7; color: #000; padding: 1em; border-radius: 3px;">`#f7f7f7`</p>
`$color-light4` | <p style="background: #efefef; color: #000; padding: 1em; border-radius: 3px;">`#efefef`</p>
`$color-dark1` | <p style="background: #252247; color: #fff; padding: 1em; border-radius: 3px;">`#252247`</p>
`$color-dark2` | <p style="background: #78768d; color: #fff; padding: 1em; border-radius: 3px;">`#78768d`</p>
`$color-dark3` | <p style="background: #a09eaf; color: #fff; padding: 1em; border-radius: 3px;">`#a09eaf`</p>
`$color-dark4` | <p style="background: #e1e0e5; color: #000; padding: 1em; border-radius: 3px;">`#e1e0e5`</p>
`$color-dark5` | <p style="background: #000; color: #fff; padding: 1em; border-radius: 3px;">`#000`</p>

## Colors (States)

Variable Name | Value
------------- | -----
`$error` | <p style="background: #f01f31; color: #fff; padding: 1em; border-radius: 3px;">`#f01f31`</p>
`$pending` | <p style="background: #ffb500; color: #fff; padding: 1em; border-radius: 3px;">`#ffb500`</p>
`$success` | <p style="background: #93ab23; color: #fff; padding: 1em; border-radius: 3px;">`#c30a28`</p>

## Font Families

The font-stack determines a preferred set of fonts to display to the user.

Variable Name | Value
------------- | -----
`$font-family` | `Open Sans`, `sans-serif`

## Font Sizes

Default values for all text appearing within modules.

Variable Name | Value
------------- | -----
`$font-size-small2` | <p style="font-size: 12px">12px</p>
`$font-size-small1` | <p style="font-size: 14px">14px</p>
`$font-size` | <p style="font-size: 16px">16px</p>
`$font-size-large1` | <p style="font-size: 18px">18px</p>
`$font-size-large2` | <p style="font-size: 24px">24px</p>
`$font-size-large3` | <p style="font-size: 42px">42px</p>

## Line Heights

Used alongside font sizes within modules.

Variable Name | Value
------------- | -----
`$line-height-small1` | 14px
`$line-height` | 16px
`$line-height-large1` | 20px
`$line-height-large2` | 24px
`$line-height-large3` | 32px
`$line-height-large4` | 64px

## Grid Spacing

Defines the default value used for margins, padding, etc.

Variable Name | Value
------------- | -----
`$gridspacing` | 8px

## Break Points

All modules start for the smallest screen size, then set overrides as needed for each of these breakpoints.

Variable Name | Value
------------- | -----
`$media-desktop-large` | 1440px
`$media-desktop` | 1024px
`$media-tablet` | 768px
`$media-mobile` | 320p

## Animation

Default values for duration and easing of all animations.

Variable Name | Value
------------- | -----
`$transition-duration` | `.25s`
`$transition-easing` | `ease-out`

## Border Radius

Variable Name | Value
------------- | -----
`$border-radius` | 4px

## Z-index

Variable Name | Value
------------- | -----
`$z-index-low` | 1
`$z-index-med` | 2
`$z-index-high` | 3
