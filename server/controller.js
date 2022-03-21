import Service from "./service.js";
import logger from "./utils.js";

export default class Controller {
  constructor() {
    this.service = new Service();
  }

  async getFileStream(file) {
    return this.service.getFileStream(file);
  }

  async handleCommand({ command }) {
    logger.info("Command received!");

    const cmd = command.toLowerCase();
    const result = {
      message: "OK",
    };

    if (cmd == "start") {
      this.service.startStreaming();
      return result;
    }

    if (cmd == "stop") {
      this.service.stopStreaming();
      return result;
    }
  }

  createClientStream() {
    const { id, clientStream } = this.service.createClientStream();

    const onClose = () => {
      logger.info(`Closing the connection with ${id}`);
      this.service.removeClientStream(id);
    };

    return {
      stream: clientStream,
      onClose,
    };
  }
}
