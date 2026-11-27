import { Config } from '@remotion/cli/config';

// Çıxış: H.264 MP4 (yuv420p). 3D (WebGL) üçün ANGLE ilə proqram renderi.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(16);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');

if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
