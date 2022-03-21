import { once } from "events";
import logger from "./utils.js";
import config from "./config.js";
import Controller from "./controller.js";

const {
  location,
  pages: { homeHtml, controllerHtml },
  constants: { CONTENT_TYPE },
} = config;
const controller = new Controller();

async function routes(req, res) {
  const { method, url } = req;

  if (method == "GET" && url == "/") {
    res.writeHead(302, {
      Location: location.home,
    });

    return res.end();
  }

  if (method == "GET" && url == "/home") {
    const { stream } = await controller.getFileStream(homeHtml);

    return stream.pipe(res);
  }

  if (method == "GET" && url == "/controller") {
    const { stream } = await controller.getFileStream(controllerHtml);

    return stream.pipe(res);
  }

  if (method == "GET" && url.includes("/stream")) {
    const { stream, onClose } = controller.createClientStream();

    req.once("close", onClose);
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "bytes", // for that we can work with on-demand audio processing
    });

    return stream.pipe(res); // we´re using stream.pipe instead of (streams/promises).pipeline, 'cause this last one was made for a full consumption, what is not so good for radios, in general
  }

  if (method == "POST" && url == "/controller") {
    const data = await once(req, "data");
    const item = JSON.parse(data);
    console.log(item);
    const result = await controller.handleCommand(item);

    return res.end(JSON.stringify(result));
  }

  if (method == "GET") {
    const { stream, type } = await controller.getFileStream(url);
    const contentType = CONTENT_TYPE[type];

    if (contentType) {
      res.writeHead(200, { "Content-Type": contentType });
    }

    return stream.pipe(res);
  }

  res.writeHead(404);
  return res.end();
}

function handleError(error, res) {
  if (error.message.includes("ENOENT")) {
    logger.warn(`The following asset was not found: ${error.stack}`);

    res.writeHead(404);
    return res.end();
  }

  logger.error(`The following error was caught on API: ${error.stack}`);

  res.writeHead(500);
  return res.end();
}

export default function handler(req, res) {
  return routes(req, res).catch((error) => handleError(error, res));
}
