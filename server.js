const http = require("http");
const axios = require("axios");
const fs = require("fs");

const hostname = "localhost";
const port = 8081;
const urlBase = "/api/";

const urlProveedores =
  "https://gist.githubusercontent.com/josejbocanegra/d3b26f97573a823a9d0df4ec68fef45f/raw/66440575649e007a9770bcd480badcbbc6a41ba7/proveedores.json";
const urlClientes =
  "https://gist.githubusercontent.com/josejbocanegra/986182ce2dd3e6246adcf960f9cda061/raw/f013c156f37c34117c0d4ba9779b15d427fb8dcd/clientes.json";

async function get(url) {
  try {
    const response = await axios.get(url);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return {};
  }
}

function handleResponse(res, type) {
  const resJson = JSON.stringify(res);
  fs.writeFile(`${type}.json`, resJson, "utf8", () => {
    console.log("Yay escribi");
  });
}

async function handleRequest(req, res) {
  const clientesRoute = "clientes";
  const proveedoresRoute = "proveedores";
  res.statusCode = 200;

  if (req.url === urlBase + proveedoresRoute) {
    const proveedores = await get(urlProveedores);
    handleResponse(proveedores, proveedoresRoute);
    res.end("Aqui deberian ir los proveedores");
  } else if (req.url === urlBase + clientesRoute) {
    const clientes = await get(urlClientes);
    handleResponse(clientes, clientesRoute);
    res.end("Aqui van los clientes");
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.statusCode = 400;
    res.end("404: Not Found");
  }
}

const server = http.createServer(handleRequest);

server.listen(port, hostname, () => {
  console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});
