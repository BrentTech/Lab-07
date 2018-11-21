/* eslint-disable indent */
'use strict';

//Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

//Load Environment Variables from the .env file
require ('dotenv').config();

//Application Setup
const PORT = process.env.PORT;
const app = express();

app.use(cors());

//API route (more later)

app.get('/location', (request, response) => {
	searchToLatLong(request.query.data)
	.then((location) => response.send(location))
	.catch((error) => handleError(error, response));
  // we are not using this data, just logging it for proof of life.
  // Look in terminal tos ee where it came  through
	// console.log(request.query.data, 'is the query that came from the search field in the browser.');
	// //this is how we will send the actual query when we move the real data rather tahn mocked data
	// const locationData = searchToLatLong(request.query.data);
	// //this is what gets sent back to the browser
	// console.log(locationData);
	// response.send(locationData);
});

//Helper functions  //feeds info to cunstructr  acts like intermediary between  api and constructor function
function searchToLatLong(query) {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
console.log(url);
	return superagent.get(url)
	.then(res => {
		console.log(res.body);
		return new Location(query, res);
	})
	.catch((error, res) => handleError(error, res));

	// // for now we are just loading a file of mock data; this will be changed to an API call in the demo in lecture 7
	// const geoData = require('./data/geo.json');
	// //Look at the data file that is a mock of the reults we will get back from google when we do the geocoding serach. We don't need all of that
	// //so now pass the data through a constructor so that we can tidy it up
	// const location = new Location (geoData.results[0]);
	// //Adding our actual search query back on and sending back to the browser
	// location.search_query = query;
	// return location;
}

function handleError(error, res){
	console.error(error);
	if (res) res.status(500).send('Sorry, something broke');
}
//This is the constructor we are using to tidy up the data and send the browser only the information that it needs.
function Location(query, res) {
	this.search_query = query;
	this.formatted_query = res.body.results[0].formatted_address;
	this.latitude = res.body.results[0].geometry.location.lat;
	this.longitude = res.body.results[0].geometry.location.lng;
}

//make sure the server is listening for requests.

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
