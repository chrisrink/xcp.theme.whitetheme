require 'rubygems' 
require 'compass'
require 'compass/exec'
 
Compass::Exec::SubCommandUI.new(["compile", "#{$sass_path}", "--sass-dir", "#{$sass_file}", "--time", "--force", "--trace", "-q"]).run!