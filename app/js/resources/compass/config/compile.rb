#Dir.entries(ARGV[0]).each do |lib|
#    $LOAD_PATH.unshift "#{ARGV[0]}/#{lib}/lib"
#end
 
require 'rubygems' 
require 'compass'
require 'compass/exec'

exit Compass::Exec::SubCommandUI.new([ARGV[0], ARGV[1], ARGV[2], ARGV[3], ARGV[4], "-q"]).run!