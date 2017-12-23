A server to enable you to define the request and response quickly, you can set the request path and the response in the way you like with just lines of code, including mock, inverse-proxy and so on.

The server also offer a basic funcionality to work as a basic static server.

# Install

```javascript
npm install -g anyroute-server
```

# How To Use

You can start the server without any parameters if you just want to set current directory as a static server:

```javascript
anyroute-server
```

And it also support some params below:

- `-p` port of the server, default to 3000
- `-d` directory of the server, default to current path
- `-c` path of the route config file, default to a `route.config.js` of current path if exists

# The Route Config

```javascript
module.exports = {
  // mock response
  'remote/demo.json': function (req, res) {
    setTimeout(() => {
      res.json({
        stat: 'ok',
        data: []
      })
    }, 300);
  },
  // map local, replace the remote file.js with local file
  'remote/file.js': 'fullpath/of/local/file.js',
  // example.com/remote/path => http://localhost/local/path
  'example.com/remote/path': 'http://localhost/local/path',
  // example.com/remote/original-path => http://another.com/remote2/original-path
  '/remote/(.*)': 'http://another.com/remote2'
}

```

## Mock response
Mock response for specified urls, you can simulate a network delay with `setTimeout`. In the related resposne function, this module exports some meta data and method for your convenience.

```javascript
/*
  the function to do the mock thing
  @param req  the request data
    {req.url} full url of the request
    {req.protocol}
    {req.headers} the headers of the request
    {req.body} the buffer body of the ruequest
  @param res  a util to do response, it contains some handy functions
    {req.json(object)} response a json object
    {req.set(object|{key, value})} set reponse headers
    {req.type(json|html|text|png)} set the mime types
    {req.status(statusCode)} set status code
    {req.jsonp(json[, callbacQueryName])} return a jsonp
    {req.end(string|object)}  response the data

*/
function (req, res) {

}

```

## Map local

Map the remote file path with local file, useful when want to proxy a remote file
```javascript
'remote/file.js': 'fullpath/of/local/file.js'
```

## Inverse proxy

Map remote request to another target

```javascript
//
'example.com/remote/path': 'http://localhost/local/path'
```

It also support to keep part of original path to target server
'/remote/(.*)': 'http://another.com/remote2'
