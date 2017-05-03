#!/bin/bash
iced main.coffee | \
ffmpeg \
    -f rawvideo \
    -r 30 \
    -pix_fmt bgr32 \
    -s:v 512x512 \
    -i - \
    -vf vflip \
    -threads 8 \
    -c:v libx264 \
    -f flv \
    rtmp://vs43.ailove.ru/cam/render
