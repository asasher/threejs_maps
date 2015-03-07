#### Initial Setup
Run the `./init` in the project root dir.
This script will install nvm, node and other required node and bower packages.
Make sure you don't have node already installed, if you have do the setup manually.
This will only work on ubuntu.

**This is still untested.**

---

Alternately you can just do stuff manually:
You will need the latest version of nodejs.
Run the following commands after downloading from project root dir:
```bash 
npm install -g gulp bower
npm install
bower install
```

#### How To Use
Get the data in the format specified below. Ans save the file as data.json in data/ dir. Run the following command to launch the app.
```bash
gulp serve
```

#### Scrips
There is a `routes_to_geojson.py` script in `scipts/`
This script changes a some csv format to GeoJson. Duplicate and modify this script to convert from other formats to GeoJson given below.

#### Data Format
Data format is GeoJson. Currently the filters are implemented for the below mentioned properties only. Every feature is expected to have all the listed properties.
```javascript
{
	"type" : "FeatureCollection",
	"features" : [
	{
		"type" : "Feature",
		"properties" : {
			"id" : "", /*emergency id*/
			"type" : "", /*emergency type*/
			"date" : "",
			"timeOfDay" : "", /*24 hours formate*/
			"responseTime" : 10, /*in minutes*/
			"color" : { /*can also be a single color. This will take precedence on everything else.*/
				"min" : "", /*min color value*/
				"max" : "", /*max color value*/
				"value" : 0.5 /*value between 0 and 1 inclusive. Linearly interpolates between min and max colors*/
				}
			},
		"geometry" : {
			"type" : "Point", /*represents a single point.*/
			"coordinates" : [0.0,0.0] /*an array of lat,long*/
		}
	},
	{
		"type" : "Feature",
		"properties" : {
			/*same as above*/
			},
		"geometry" : {
			"type" : "LineString", /*represents a series of points for a line e.g a route. Will be shown when show-routes is selected.First and Last element only will be shown when show-sources or show-destinations is selected respectively.*/
			"coordinates" : [[0.0,0.0],[0.0,0.0]] /*an array of arrays of lat,long*/
		}
	},
	{
		"type" : "Feature",
		"properties" : {
			/*same as above*/
			},
		"geometry" : {
			"type" : "MultiPoint", /*represents a series of points for a scatter plot. Will show when show-scatter is selected.*/
			"coordinates" : [[0.0,0.0],[0.0,0.0]] /*an array of arrays of lat,long*/
		}
	},
	{
		"type" : "Feature",
		"properties" : {
			/*same as above*/
			},
		"geometry" : {
			"type" : "Rectangle", /*represents 2 of points for a rectangle. Will be shown when show-grid is selected.*/
			"coordinates" : [[0.0,0.0],[0.0,0.0]] /*an array of 2 arrays of lat,long representing 2 corners*/
		}
	}
	]
}
```