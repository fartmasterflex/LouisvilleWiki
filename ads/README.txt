BILLBOARD ADS
=============

Drop images in this folder and they appear on the billboard in the 3D header.
It flips to the next ad every 20 seconds (click the billboard to flip early).

NAMING: number them, starting at 1, with no gaps:
    1.png
    2.png
    3.jpg
    ...
The billboard counts up from 1 and stops at the first missing number,
so if you delete 2.png, rename 3 -> 2, 4 -> 3, etc.

SIZE: 1024 x 512 pixels (2:1). Bigger at the same ratio (2048 x 1024) is fine.
Other sizes still work but get black bars instead of being stretched.

FORMATS: png, jpg, jpeg, webp, gif (gifs show their first frame).

TIPS: the billboard is roughly 300px wide on a laptop screen, so use BIG,
bold text — a headline you could read from a moving car.

While this folder has no numbered images, the billboard shows two built-in
"THIS SPACE AVAILABLE" house ads.

Settings (size, seconds per ad, folder) live at the top of js/ads.js.
