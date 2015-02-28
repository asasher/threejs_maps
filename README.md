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
			"timeOfDay" : "",
			"responseTime"
			},
		"geometry" : {
			"type" : "Point", /*represents a single point e.g a source or a destination*/
			"coordinates" : [0.0,0.0] /*an array of lat,long*/
		}
	},
	{
		"type" : "Feature",
		"properties" : {
			/*same as above*/
			},
		"geometry" : {
			"type" : "LineString", /*represents a series of points e.g a route*/
			"coordinates" : [[0.0,0.0],[0.0,0.0]] /*an array of arrays of lat,long*/
		}
	},
	/*another geometry type for a scatter plot*/
	]
}
```