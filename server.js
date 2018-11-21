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

//API route

app.get('/location', (request, response) => {
	searchToLatLong(request.query.data)
	.then((location) => response.send(location))
	.catch((error) => handleError(error, response));
});

app.get('/weather', getWeather);

app.get('/yelp', getYelp);

//Error Handling
function handleError(err, res) {
	console.error(err);
	if (res) res.satus(500).send('Sorry, somthing went wrong');
}

//Helper functions
function searchToLatLong(query) {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
console.log(url);
	return superagent.get(url)
	.then(res => {
		console.log(res.body);
		return new Location(query, res);
	})
	.catch((error, res) => handleError(error, res));
}

function getWeather(request, response) {
	const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

	superagent.get(url)
		.then(result => {
			const weatherSummaries = result.body.daily.data.map(day => {
				return new Weather(day);
			});
		response.send(weatherSummaries);
		})
		.catch(error => handleError(error, response));
}

function getYelp(request, response) {
	const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${request.query.data.latitude}&longitude=${request.query.data.longitude}`;

	superagent.get(url)
	.set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
	.then( result => {
		// console.log(result);
		const yelpBusinesses = result.body.businesses.map(restaurant => {
			return new Yelp(restaurant);
		});
	response.send(yelpBusinesses);
	})
	.catch(error => handleError(error, response));
}

function handleError(error, res){
	console.error(error);
	if (res) res.status(500).send('Sorry, something broke');
}

// models

function Location(query, res) {
	this.search_query = query;
	this.formatted_query = res.body.results[0].formatted_address;
	this.latitude = res.body.results[0].geometry.location.lat;
	this.longitude = res.body.results[0].geometry.location.lng;
}

function Weather(day) {
	this.forecast = day.summary;
	this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Yelp(restaurant) {
	this.url = restaurant.url;
	this.name = restaurant.name;
	this.rating = restaurant.rating;
	this.price = restaurant.price;
	this.img_url = restaurant.img_url;
}

//make sure the server is listening for requests.
app.listen(PORT, () => console.log(`App is up on ${PORT}`));
