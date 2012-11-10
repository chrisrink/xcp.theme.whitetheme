require 'fileutils'

# Grab the current dir
dir = File.dirname(__FILE__)
 
def cleanup	
=begin	
	curDir = File.basename(File.dirname(__FILE__));
	curScript = File.basename(__FILE__)
		
	if (curDir != "custom-themes")
		return
	end
	
	Dir.foreach($dir) {|file|
		next if (file==curScript or file == "." or file == ".." or file == ".sass-cache")
		 
		if (File.directory?(file))
			FileUtils.rm_rf(file)
		else
			File.delete(file)
		end		 
	}  			
=end	
end


# Set our Ext path
$ext_path = '../../ext-4.1/'   # This is our 'web' path
ext_filesystem_path = "../../ext-4.1/"

xcp_theme_filesystem_path = "../themes/"

# We need to load in the extjs themes folder, which includes all it's default styling, images, variables and mixins
load File.join(dir, ext_filesystem_path, 'resources', 'themes')

#load xcp theme
load File.join(dir, xcp_theme_filesystem_path)


# Sort out our SASS, CSS and images dirs
sass_path = dir
#css_path = File.join(dir, "..", "css")

css_path = $css_path
images_dir = File.join($ext_path, "..", "images")

# Specify the output style/environment
output_style = :expanded #:compressed
environment = :development #:production


on_stylesheet_error do |filename, message|
	$javaCaller.onStylesheetError(filename, message)
	if ($cleanup_after_finish)
		cleanup
	end
end

on_stylesheet_saved do |filename|
	$javaCaller.onStylesheetSaved(filename)		
	if ($cleanup_after_finish)
		cleanup
	end
end


