import { join, dirname } from "path";
import { fileURLToPath } from "url";

const url = import.meta.url;
const currentDir = dirname(fileURLToPath(url));
const rootDir = join(currentDir, "../");

const audioDirectory = join(rootDir, "audio");
const publicDirectory = join(rootDir, "public"); // static pages

export default {
  port: process.env.PORT || 3000, // the environment variable will be an interesting approach when the project is running in production
  dir: {
    rootDir,
    audioDirectory,
    fxDirectory: join(audioDirectory, "fx"),
    songsDirectory: join(audioDirectory, "songs"),
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
  },
};
