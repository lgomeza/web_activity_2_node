const http = require("http");
const axios = require("axios");
const fs = require("fs");

//server related constants
const hostname = "localhost";
const port = 8081;

//constants for data urls
const urlProveedores =
  "https://gist.githubusercontent.com/josejbocanegra/d3b26f97573a823a9d0df4ec68fef45f/raw/66440575649e007a9770bcd480badcbbc6a41ba7/proveedores.json";
const urlClientes =
  "https://gist.githubusercontent.com/josejbocanegra/986182ce2dd3e6246adcf960f9cda061/raw/f013c156f37c34117c0d4ba9779b15d427fb8dcd/clientes.json";

const urlBase = "/api/";
const urls = {
  clientes: urlClientes,
  proveedores: urlProveedores,
};

//routes constants
const clientesRoute = "clientes";
const proveedoresRoute = "proveedores";

/**
 * Receives a url and gets the data out of the fetched JSON response (uses axios)
 * @param  {String} url The url where the needed data is stored
 * @return {Object} Returns the data property of the response.
 */
async function get(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    return {};
  }
}

/**
 * Function that processes the information found on res depending on what type of data is being received
 * and creates the HTML file using the necessary properties.
 * @param  {Object} res The object that contains the data received from the data source
 * @param  {String} type The type of data that is being received. In this case, it is either "clientes" or "proveedores"
 * @return {String} Returns the processed HTML text.
 */
function handleResponse(res, type) {
  const htmlUrl = __dirname + "/index.html";
  let htmlContent = fs.readFileSync(htmlUrl, { encoding: "utf-8" });
  htmlContent = htmlContent.replace(new RegExp("replace-type", "g"), type);
  let rowsContent = "";
  switch (type) {
    case proveedoresRoute:
      res.forEach((row) => {
        rowsContent += `<tr>
        <th scope="row">${row.idproveedor}</th>
        <td>${row.nombrecompania}</td>
        <td>${row.nombrecontacto}</td>
      </tr>`;
      });
      break;
    case clientesRoute:
      res.forEach((row) => {
        rowsContent += `<tr>
        <th scope="row">${row.idCliente}</th>
        <td>${row.NombreCompania}</td>
        <td>${row.NombreContacto}</td>
      </tr>`;
      });
      break;
  }

  htmlContent = htmlContent.replace("replace-content", rowsContent);

  return htmlContent;
}

/**
 * Function that processes every request sent by the client and sends back a response.
 * @param  {http.ClientRequest} req The object containing the client request
 * @param  {http.ServerResponse} res The object that will be sent as the server response.
 */
async function handleRequest(req, res) {
  res.statusCode = 200;

  if (req.url.includes(urlBase)) {
    const requiredPath = req.url.replace(urlBase, "");
    const data = await get(urls[requiredPath]);
    const finalHtml = handleResponse(data, requiredPath);
    res.end(finalHtml);
  } else if (req.url == "/") {
    res.end(
      `<html><head><title>Sistema de clientes y proveedores</title></head><h1>Bienvenido al sistema de clientes y proveedores</h1><a href="http://${hostname}:${port}/api/clientes">Ir a clientes</a><br/><a href="http://${hostname}:${port}/api/proveedores">Ir a proveedores</a></html>`
    );
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
