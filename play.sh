#!/bin/bash
iced main.coffee | \
ffplay \
    -f rawvideo \
    -pix_fmt bgr32 \
    -s:v 512x512 \
    -vf vflip \
    -i -
