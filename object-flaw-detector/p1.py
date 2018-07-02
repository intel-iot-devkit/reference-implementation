from influxdb import InfluxDBClient

import sys
print(sys.argv[1])
print("After each itereation")


message = sys.argv[1]

#influx_client = InfluxDBClient(host=influx_hostname, port=influx_port, username=influx_username, password=influx_password, database=influx_database)

influx_client.create_database('example_3')
file_to_publish = [
{
	"measurement": "plc_table",    
		"fields": {

		"value" : message
	}
}
] 
try:
	influx_client.write_points(file_to_publish)
	print("Success!!! data sent to influx")
except:
	print("Cannot send the data to influx")
