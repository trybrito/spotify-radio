import Service from "./service.js";

export default class Controller {
  constructor() {
    this.service = new Service();
  }

  async getFileStream(file) {
    return this.service.getFileStream(file);
  }
}
