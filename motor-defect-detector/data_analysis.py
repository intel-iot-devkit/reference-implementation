"""
Fetches the real-time data from H2 DB for Rule-based Analysis, which is published to InfluxDB installed on AWS EC2 Linux instance.
Generates a graphical representation of data on Grafana installed on AWS EC2 Linux instance.
The data on H2 DB is published by a PLC through Eclipse Kura on UP Squared board
"""
import time
import signal
import sys
import json
from influxdb import InfluxDBClient
import jaydebeapi
# --------------------------------------------------------------------------- #
# configure the service logging
# --------------------------------------------------------------------------- #
import logging
logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.DEBUG)
  
bool_variable=True

def signal_handler(signal, frame):
    """

    :param signal: Ctrl+C
    :return:
    """
    global bool_variable
    log.info('You pressed Ctrl+C!')
    bool_variable = False
    if curs is not None:
        curs.close()
    if conn is not None:
        conn.close()
    if influx_client is not None:
        influx_client.close()
    sys.exit(0)  
 
 
# -------------------------------To Fetch Data from H2 DB-------------------- #     
def get_h2db_data():
    try:
        global bool_variable
        while(bool_variable == True):
            # Fetch the last 1 timestamp
            curs.execute("SELECT \"smcAC\",\"smcDC\",\"vib_table\" FROM \"ModbusData\" ORDER BY TIMESTAMP DESC LIMIT 1")
            for value in curs.fetchall():
                smcAC=value[0]
                smcDC=value[1]
                vib_table=value[2]
                raw_json={'smcAC_amp':smcAC, 'smcDC_amp':smcDC, 'vib_table_hz':vib_table}
                modbus_analysis(raw_json)
            time.sleep(3)      
    except Exception as err:
        log.info("H2DB read error: {}" .format(str(err)))
                

# ---------------------------------Rule Based Analytics---------------------- #
def  modbus_analysis(data):
    """

    :param data: json file generated in get_h2db_data function
    :return:
    """
    thresholds = config["modbus_thresholds"]
    alerts = config["modbus_alerts"]    
    json_result = data
    for alert in alerts:
        result = "Normal"
        for alr in alerts[alert]["rules"].keys():
            rule_based_string = (alerts[alert]["rules"][alr])
            if (alr == "low"):
                if (rule_based_string is not None and eval(rule_based_string) == True):
                    result = "Low"
                        
            if (alr == "high"):
                if (rule_based_string is not None and eval(rule_based_string) == True):
                    result = "High"

        json_result["alert_"+alert] = result

    log.info("modbus result")
    log.info("{}".format(json_result))
    push_to_influx((json_result))  
        
   
# ------------------------------To push data to Influx---------------------- #     
def push_to_influx(json_file):
    """

    :param json_file: json file generated in modbus_analysis function
    :return:
    """
    message = (json_file)
    file_to_publish = [
    {
        "measurement": influx_measurement,    
        "fields": message
    }
    ] 
    try:
        influx_client.write_points(file_to_publish)
        log.info("Success!!! data sent to influx")
    except Exception as err:
        err_str=str(err).split(',')
        log.info("InfluxDB write error: {}" .format(str(err_str[2])))


# ----------------------------------Main Fuction--------------------------- #                             
if __name__ == "__main__":
    with open("config.json") as file:
        config = json.load(file)
    
    #--------------configure H2DB connection-----------#
    h2db_username = config["h2db_username"]
    h2db_password = config["h2db_password"] 
    h2db_jar_location = config["h2db_jar_location"]  
    try:
        conn = jaydebeapi.connect("org.h2.Driver", # driver class
                                "jdbc:h2:tcp:localhost:9123/mem:kuradb", # JDBC url
                                [h2db_username, h2db_password],
                                h2db_jar_location,)                    
        curs = conn.cursor() 
    except Exception as err:
        log.info("H2DB connection error: {}" .format(str(err)))
    
    #-----------configure InfluxDB connection----------#
    influx_hostname = config["influx_host"]
    influx_port = int(config["influx_port"])
    influx_database = config["influx_database"]
    influx_username = config["influx_username"]
    influx_password = config["influx_password"]
    influx_measurement = config["influx_measurement"]
    # InfluxDB client on AWS
    try:
        influx_client = InfluxDBClient(host=influx_hostname, port=influx_port, username=influx_username, password=influx_password, database=influx_database,timeout=3)
    except Exception as err:
        log.info("InfluxDB connection error: {}" .format(str(err)))  
          
    signal.signal(signal.SIGINT, signal_handler)
    get_h2db_data()
