import fs from "fs";
import fsPromises from "fs/promises";
import streamsPromises from "stream/promises";
import { once } from "events";
import { PassThrough, Writable } from "stream";
import { randomUUID } from "crypto";
import { join, extname } from "path";
import config from "./config.js";
import Throttle from "throttle";
import childProcess from "child_process";
import logger from "./utils.js";

const {
  dir: { publicDirectory },
  constants: { fallbackBitRate, englishConversation, bitRateDivisor },
} = config;

export default class Service {
  constructor() {
    this.clientStreams = new Map();
    this.currentSong = englishConversation;
    this.currentBitRate = 0;
    this.throttleTransform = {};
    this.currentReadable = {};
  }

  createClientStream() {
    const id = randomUUID();
    const clientStream = new PassThrough();

    this.clientStreams.set(id, clientStream);

    return { id, clientStream };
  }

  removeClientStream(id) {
    this.clientStreams.delete(id);
  }

  _executeSoxCommand(args) {
    return childProcess.spawn("sox", args);
  }

  async getBitRate(song) {
    try {
      const args = ["--i", "-B", song];
      const { stdin, stdout, stderr } = this._executeSoxCommand(args); // the underline present in this function is only to inform that it's a private function (what can also be done with '#', although the tools for code coverage collection don't understand it very well)

      await Promise.all([once(stdout, "readable"), once(stderr, "readable")]);

      const [success, error] = [stdout, stderr].map((stream) => stream.read());

      if (error) {
        return await Promise.reject(error); // if we want that the catch statement get this error, we have to use await before the Promise
      }

      return success.toString().trim().replace("k", "000"); // 128k will turn to 128000
    } catch (error) {
      logger.error(
        `De acordo com o seguinte erro, há algo errado com o bit rate do arquivo: ${error.stack}`
      );

      return fallbackBitRate;
    }
  }

  broadcast() {
    return new Writable({
      write: (chunk, enc, cb) => {
        for (const [id, stream] of this.clientStreams) {
          if (stream.writableEnded) {
            this.removeClientStream(id);
            continue;
          }

          stream.write(chunk);
        }

        cb();
      },
    });
  }

  async startStreaming() {
    logger.info(`Starting with ${this.currentSong}`);

    const bitRate = (this.currentBitRate =
      (await this.getBitRate(this.currentSong)) / bitRateDivisor);
    const throttleTransform = (this.throttleTransform = new Throttle(bitRate));
    const songReadable = (this.currentReadable = this.createFileStream(
      this.currentSong
    ));

    return streamsPromises.pipeline(
      songReadable,
      throttleTransform, // throttle will, basically, set a limit to the amount of butes that can pass through it.
      this.broadcast()
    );
  }

  stopStreaming() {
    this.throttleTransform?.end?.();
  }

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    const fullFilePath = join(publicDirectory, file);
    await fsPromises.access(fullFilePath); // if the given path exists, nothing happens, but if the path doesn't, an error is sent to the presentation layer.

    return {
      type: extname(fullFilePath),
      filename: fullFilePath,
    };
  }

  async getFileStream(file) {
    const { type, filename } = await this.getFileInfo(file);

    return {
      type,
      stream: this.createFileStream(filename),
    };
  }
}
