import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import config from "../../../server/config.js";
import Controller from "../../../server/controller.js";
import handler from "../../../server/routes.js";
import TestUtil from "../_utils/testutil.js";

const {
  location,
  pages: { homeHtml, controllerHtml },
  constants: { CONTENT_TYPE },
} = config;

describe("#Routes - test suite for API response", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("GET '/' - should redirect to homepage", async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/";

    await handler(...params.values());

    expect(params.response.writeHead).toBeCalledWith(302, {
      Location: location.home,
    });
    expect(params.response.end).toHaveBeenCalled();
  });

  test(`GET '/home' - should respond with ${homeHtml} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/home";

    const mockFileStream = TestUtil.generateReadableStream(["data"]);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(homeHtml);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET '/controller' - should respond with ${controllerHtml} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/controller";

    const mockFileStream = TestUtil.generateReadableStream(["data"]);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(controllerHtml);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test("GET '/index.html' - should respond with a file stream", async () => {
    const filename = "/index.html";

    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = filename;

    const mockFileStream = TestUtil.generateReadableStream(["data"]);
    const expectedType = ".html";

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(filename);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": CONTENT_TYPE[expectedType],
    });
  });

  test("GET '/file.ext' - should respond with a file stream", async () => {
    const filename = "/file.ext";

    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = filename;

    const mockFileStream = TestUtil.generateReadableStream(["data"]);
    const expectedType = ".ext";

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(filename);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).not.toHaveBeenCalled();
  });

  test("POST '/unknown' - given an inexistent route, it should respond with a 404 status code", async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = "POST";
    params.request.url = "/index.png";

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  describe("exceptions", () => {
    test("given an inexistent file, it should respond with a 404 status code", async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = "GET";
      params.request.url = "/unknown";

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(
          new Error("Error: ENOENT: no such file or directory!") // this string must have the ENOENT word, because, without it, the if statement will fail
        );

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });

    test("given an error, it should responde with a 500 status code", async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = "GET";
      params.request.url = "/unknown";

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error("Error"));

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});
