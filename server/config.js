import { join, dirname } from "path";
import { fileURLToPath } from "url";

const url = import.meta.url;
const currentDir = dirname(fileURLToPath(url));
const rootDir = join(currentDir, "../");

const audioDirectory = join(rootDir, "audio");
const songsDirectory = join(audioDirectory, "songs");
const fxDirectory = join(audioDirectory, "fx");
const publicDirectory = join(rootDir, "public"); // static pages

export default {
  port: process.env.PORT || 3000, // the environment variable will be an interesting approach when the project is running in production
  dir: {
    rootDir,
    audioDirectory,
    fxDirectory,
    songsDirectory,
    publicDirectory,
  },
  pages: {
    homeHtml: "home/index.html",
    controllerHtml: "controller/index.html",
  },
  location: {
    home: "/home",
  },
  constants: {
    CONTENT_TYPE: {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
    },
    audioMediaType: "mp3",
    songVolume: "0.99",
    fallbackBitRate: "128000",
    bitRateDivisor: 8,
    englishConversation: join(songsDirectory, "conversation.mp3"),
  },
};
