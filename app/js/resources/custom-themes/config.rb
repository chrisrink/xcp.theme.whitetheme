require 'fileutils'
 
 
def cleanup	

=begin
	dir = File.dirname(__FILE__)
	curDir = File.basename(File.dirname(__FILE__));
	curScript = File.basename(__FILE__)
		
	if (curDir != "custom-themes")
		return
	end
	
	Dir.foreach(dir) {|file|
		next if (file==curScript or file == "." or 	file == ".." or file == "config.rb" or 	file == ".sass-cache")
 		 
		if (File.directory?(file))
			FileUtils.rm_rf(file)
		else
			FileUtils.rm(file)
		end	 
	} 
=end
end

# Grab the current dir
dir = File.dirname(__FILE__)

# Set our Ext path
$ext_path = '../../ext-4.1/'   # This is our 'web' path
ext_filesystem_path = $ext_filesystem_path

xcp_theme_filesystem_path = $xcp_filesystem_path

# We need to load in the extjs themes folder, which includes all it's default styling, images, variables and mixins
load File.join(ext_filesystem_path, 'resources', 'themes')

#load xcp theme
load xcp_theme_filesystem_path


# Sort out our SASS, CSS and images dirs
sass_path = dir

cache_path = File.join(dir, "..", "cache")

#css_path = File.join(dir, "..", "css")

css_path = $css_path

puts "css_path #{$css_path}"

images_dir = File.join($ext_path, "..", "images")

# Specify the output style/environment
output_style = :expanded #:compressed
environment = :development #:production

# Increment the deploy_version before every release to force cache busting.
deploy_version = 1
asset_cache_buster do |http_path, real_path|
  if File.exists?(real_path)
    File.mtime(real_path).strftime("%s")
  else
    "v=#{deploy_version}"
  end
end

#call back from compass
on_stylesheet_error do |filename, message|
	$javaCaller.onStylesheetError(filename, message)
	if ($cleanup_after_finish)
		cleanup
	end
end

#call back from compass
on_stylesheet_saved do |filename|
	$javaCaller.onStylesheetSaved(filename)		
	if ($cleanup_after_finish)
		cleanup
	end
end


