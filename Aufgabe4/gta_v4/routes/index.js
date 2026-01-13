// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');

const geoTagStore = new GeoTagStore();

// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  res.render('index', {
    taglist: [],
    latitude: "",
    longitude: ""
  })
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

router.get('/api/geotags', (req, res) => {
  let latitude = req.query.latitude ? parseFloat(req.query.latitude) : undefined;
  let longitude = req.query.longitude ? parseFloat(req.query.longitude) : undefined;
  let searchTerm = req.query.searchterm;

  if (latitude < -180 || latitude > 180) {
    latitude = undefined;
  }
  if (longitude < -90 || longitude > 90) {
    longitude = undefined;
  }

  const nearbyGeoTags = geoTagStore.searchNearbyGeoTags(searchTerm, latitude, longitude);
  res.json(nearbyGeoTags);
});


/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post('/api/geotags', (req, res) => {
  let latitude = req.query.latitude ? parseFloat(req.query.latitude) : undefined;
  let longitude = req.query.longitude ? parseFloat(req.query.longitude) : undefined;

  if (latitude < -180 || latitude > 180) {
    latitude = undefined;
  }
  if (longitude < -90 || longitude > 90) {
    longitude = undefined;
  }
  
  const newGeoTag = geoTagStore.addGeoTag(new GeoTag (latitude, longitude, req.body.name, req.body.hashtag));

  res.setHeader('Location', '/api/geotags/${newGeoTag.getId()}');
  res.status(201);
  res.json(newGeoTag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get('/api/geotags/:id', (req, res) => {
  let id = req.params.id ? parseInt(req.params.id) : undefined;
  if (id === undefined || id < 0) {
    res.json([]);
    return
  }
  res.json(geoTagStore.getGeoTagById(id));
});


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

router.put('/api/geotags/:id', (req, res) => {
  let id = req.params.id ? parseInt(req.params.id) : undefined;
  if (id === undefined || id < 0) {
    res.json([]);
    return;
  }

  const newLatitude = req.body.latitude ? parseFloat(req.body.latitude) : undefined;
  if (latitude < -180 || latitude > 180) {
    latitude = undefined;
  }

  const newLongitude = req.body.longitude ? parseFloat(req.body.longitude) : undefined;
  if (longitude < -90 || longitude > 90) {
    longitude = undefined;
  }
  const newName = req.body.name === '' ? undefined : req.body.name;

  const newHashtag = req.body.hashtag === '' ? undefined : req.body.hashtag;
  
  res.json(geoTagStore.changeGeotagById(id, newLatitude, newLongitude, newName, newHashtag));
});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

router.delete('/api/geotags/:id', (req, res) => {
  let id = req.params.id ? req.params.id : undefined;
  if (id === undefined || id < 0) {
    res.json([]);
    return;
  }

  const deletedGeotag = getGeoTagById(id);
  geoTagStore.removeGeoTagById(id);
  res.json(deletedGeotag);

});

module.exports = router;
