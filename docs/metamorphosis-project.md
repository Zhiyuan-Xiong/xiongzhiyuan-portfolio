# 蜕变 / Metamorphosis

The 12th index project is a TouchDesigner audiovisual study. Both language routes contain the full case, five chapters, the original output film, and a browser audio-reactive reconstruction. The native butterfly geometry and liquid background are reused. The website does not run the native .toe engine.

## Source evidence

- `D:/skills portfolio/NewProject-pointcoud.toe`: read through the installed Derivative toeexpand command. Originals remain untouched; the expanded parameter files stay in the private cache.
- `D:/skills portfolio/model.obj`: 6,503 vertices, 13,110 triangulated faces. A fixed seed samples 48,000 points over the actual triangle surface, with area weighting.
- `D:/skills portfolio/bg.png`: original liquid background.
- `D:/skills portfolio/final portfolio/png-07.jpg`, `png-08.jpg`, `png-09.jpg`: source presentation pages at 4,962 × 3,509. Extract the visual, complete network, five-stage composition, eight-state composition, installation view and working views. Whole pages and student metadata are not published.
- `D:/skills portfolio/视频/1.mov`: 2.167 seconds, no audio. Slow it into a five-second transition and dissolve into the already playing hero element.
- `D:/skills portfolio/TDMovieOut.0.mov`: 19.43 seconds, no audio. Full original output is used for the hero and controlled film.

## Source mappings and browser adaptation

The native audio branch is Audio Device In → Analyze (`rmspower`) → Math (`gain 5`) → Filter (`width .22`) → Null. It controls Noise POP amplitude and a model transform with `1 + abs(audio)`. A separate time-varying Noise CHOP drives Displace TOP; the page describes that separate branch accurately.

The browser uses Web Audio RMS analysis, gain 5, and exponential response smoothing with a .22-second time constant. Real analyser data drives model scale and particle displacement. FFT bands add secondary visual variation. WebGL renders the original sampled model, a lightly distorted original backdrop, a local halo and outward particles. This is a reconstruction of the source relationships, not a claim of pixel-identical native TouchDesigner simulation.

Inputs: microphone after an explicit user action, a local audio file decoded on the device, and a small synthesized rhythm passed through the same actual analyser. Local audio is not sent to a server; microphone input is not connected to speakers. Demo/file playback volume changes the monitor gain independently of the analysed signal.

## Lifecycle and integration

Lazy load the 540 KB compressed geometry near the viewport. Preserve aspect ratio, cap device pixels and render at a maximum 30 fps. Offscreen/hidden scenes stop their animation loop and suspend audio processing. Page departure releases observers, events, audio sources and microphone tracks, and disposes WebGL resources. Pause visuals and Stop audio are separate controls.

The carousel and classified strip share the added cover and bilingual introduction. The exploration scene adds a cold cyan planet on its ordered orbital lanes; its hover star figure has symmetrical wings. The full index constellation combines skeletal butterfly contours and an audio waveform. The entrance planet image remains grayscale with restrained exposure.

## Validation

Astro checks and the full build pass. Static validation covers both cases, all chapter IDs, analysis media, audio UI, every index/explore entry, finite model coordinates, and excluded submission metadata. Browser QA exercises the real rhythm signal, local audio decoding, keyboard orbit/reset, stopped and paused states, offscreen suspension, the five-second media handoff, and mobile layout. Microphone permission is left for the user to enable.
