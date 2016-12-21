require 'sinatra'
require 'sinatra/base'
require 'active_support'

ActiveSupport::JSON::Encoding.time_precision = 0

class Api < Sinatra::Base
  APP_VERSION = 0.1

  INITIAL_TEMP_THRESHOLD = 75.4
  INITIAL_TEMP = 66.3
  INITIAL_DEMO_STATUS = 0
  INITIAL_DEMO_STEP = 1
  INITIAL_DOOR_STATUS = 0

  @@temp_threshold = INITIAL_TEMP_THRESHOLD
  @@temperature = INITIAL_TEMP
  @@demo_status = INITIAL_DEMO_STATUS
  @@demo_step = INITIAL_DEMO_STEP
  @@door_status = INITIAL_DOOR_STATUS

  def self.get_or_post(url, &block)
    get url, &block
    post url, &block
  end

  get_or_post '/version' do
    return { version: APP_VERSION }.to_json
  end

  get_or_post '/getData' do
    case params[:value]
      when 'current'  then  get_current_data
      when 'log'      then  get_log
      when 'reset'    then  reset_demo && "ResetComplete"
      else
        bad_request("Unrecognized 'value' parameter: #{params[:value]}")
    end
  end

  get_or_post '/threshold' do
    @@temp_threshold = params[:value].to_f if params[:value].present?
    [{threshold: @@temp_threshold}].to_json
  end

  get_or_post '/update' do
    new_value = params[:value]
    result = case params[:name]
      when 'demo_status'
        @@demo_status = new_value.to_i
      when 'demo_step', 'current_step'
        @@demo_step = new_value.to_i
      when 'door_status'
        @@door_status = new_value.to_i
      when 'temperature'
        @@temperature = new_value
      else
        bad_request("Unrecognized 'name' parameter: '#{params[:name]}'")
    end
    result.to_s
  end

  private

  def bad_request(details)
    halt(400, format_error_details(details))
  end

  def not_found
    halt(404)
  end

  def get_current_data
    timestamp = Time.now.to_formatted_s(:iso8601)
    %Q(
      [{"timestamp": "#{timestamp}", "demo_status": #{@@demo_status}, "current_step": #{@@demo_step}, "door_status": #{@@door_status}, "temp": #{@@temperature}, "threshold": #{@@temp_threshold} }]
    )
  end

  def get_log
    %Q(
      [
        {"timestamp": "04/24/2015T15:04:03Z", "threshold": #{@@temp_threshold}, "temp": 71.4, "event": "Button Pressed"},
        {"timestamp": "04/24/2015T15:04:13Z", "threshold": #{@@temp_threshold}, "temp": 73.4, "event": "Temperature Rising"},
        {"timestamp": "04/24/2015T15:04:23Z", "threshold": #{@@temp_threshold}, "temp": 75.4, "event": "Exceeded Threshold"},
        {"timestamp": "04/24/2015T15:04:03Z", "threshold": #{@@temp_threshold}, "temp": 71.4, "event": "Button Pressed"}
      ]
    )
  end

  def reset_demo
    @@temp_threshold = INITIAL_TEMP_THRESHOLD
    @@temperature = INITIAL_TEMP
    @@demo_status = INITIAL_DEMO_STATUS
    @@demo_step = INITIAL_DEMO_STEP
    @@door_status = INITIAL_DOOR_STATUS
  end

  def format_error_details(details)
    details = { error: details } unless details.is_a?(Hash)
    details.to_json
  end
end
