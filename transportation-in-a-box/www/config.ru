require 'rubygems'
require './app/api'

# Serve our index file by default
use Rack::Static , :urls => { "/" => "index.html" } , :root => "."

run Rack::URLMap.new({
  '/' => Rack::Directory.new( "." ), # Serve our static content
  '/ExpKit' => Api.new
})
