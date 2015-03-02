# python script to format data in format:
# id	date	emtype	responsetime	src	dest
# to GeoJson.
# Modify accordingly for different source data

import json

data = {
	'type' : 'FeatureCollection',
	'features' : []
}
def trace_reader(filename):
	with open(filename) as f:
		for l in f:
			yield l


lines = list(trace_reader('path_to_in_file'))
for line in lines:
	fields = line.split('\t')

	route = [[float(x) for x in loc.split(',')[:2]] for loc in fields[7].split(';')[:-1]]
	emid = fields[0]
	date = fields[1]
	responsetime = int(fields[2])
	emtype = fields[4]
	vehiclenumber = fields[5]
	emtime = fields[6]

	feature = {
		'type': 'Feature',
		'properties': {
			'id': emid,
			'type': emtype,
			'date': date,
			'timeOfDay': emtime,
			'responseTime': responsetime,
			'color': {
				'min': '#ffffff',
				'value': float(responsetime) / 30,
				'max': '#ff0000'
			}		
		},
		'geometry': {
			'type': 'LineString',
			'coordinates': route[:-1]
		}
	}

	data['features'].append(feature)

print json.dumps(data, indent=4, sort_keys=True)
