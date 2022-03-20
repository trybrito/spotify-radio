import fs from "fs";
import fsPromises from "fs/promises";
import { join, extname } from "path";
import config from "./config.js";

export default class Service {
  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    const fullFilePath = join(config.dir.publicDirectory, file);
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
