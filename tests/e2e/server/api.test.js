import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import superTest from "supertest"; // this lib (or similar) is necessary to make request to our own API.
import portfinder from "portfinder"; // and this, will scan and find the ports that are available in our computer.
import Server from "../../../server/server.js";
import config from "../../../server/config.js";
import { Transform } from "stream";
import { setTimeout } from "timers/promises";

const getAvailablePort = portfinder.getPortPromise;
const RETENTION_DATA_PERIOD = 200;

describe("@API E2E Suite Test", () => {
  const commandResponse = JSON.stringify({
    result: "OK",
  });
  const possibleCommands = {
    start: "start",
    stop: "stop",
  };

  function pipeAndReadableStream(stream, onChunk) {
    const transform = new Transform({
      transform(chunk, enc, cb) {
        onChunk(chunk);

        cb(null, chunk);
      },
    });

    return stream.pipe(transform);
  }

  describe("client workflow", () => {
    async function getTestServer() {
      const getSuperTest = (port) => superTest(`http://localhost:${port}`);
      const port = await getAvailablePort();

      return new Promise((resolve, reject) => {
        const server = Server.listen(port)
          .once("listening", () => {
            const testServer = getSuperTest(port);
            const response = {
              testServer,
              kill() {
                server.close();
              },
            };

            return resolve(response);
          })
          .once("error", reject);
      });
    }

    function commandSender(testServer) {
      return {
        async send(command) {
          const response = await testServer
            .post("/controller")
            .send({ command });

          expect(response.text).toStrictEqual(commandResponse);
        },
      };
    }

    test("it should not receive data stream if the process isn't playing", () => {
      const server = await getTestServer();
      const onChunk = jest.fn();

      pipeAndReadableStream(server.testServer.get("/stream"), onChunk);
      await setTimeout(RETENTION_DATA_PERIOD);

      server.kill();
      expect(onChunk).not.toHaveBeenCalled();
    });

    test("it should receive data stream if the process is playing", () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      const { send } = commandSender(server.testServer);

      pipeAndReadableStream(server.testServer.get("/stream"), onChunk);
      await send(possibleCommands.start);
      await setTimeout(RETENTION_DATA_PERIOD);
      await send(possibleCommands.stop);

      const [[buffer]] = onChunk.mock.calls;
      expect(buffer).toBeInstanceOf(Buffer);

      server.kill();
      expect(onChunk).not.toHaveBeenCalled();
    });
  });
});