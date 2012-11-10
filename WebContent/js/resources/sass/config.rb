# Grab the current dir
dir = File.dirname(__FILE__)

# Set our Ext path
$ext_path = '../../ext-4.1/'   # This is our 'web' path
ext_filesystem_path = "../../ext-4.1/"

# We need to load in the extjs themes folder, which includes all it's default styling, images, variables and mixins
load File.join(dir, ext_filesystem_path, 'resources', 'themes')

#load xcp theme path
load File.join(dir, '../', 'resources', 'themes')


# Sort out our SASS, CSS and images dirs
sass_path = dir
css_path = File.join(dir, "..", "css")
images_dir = File.join($ext_path, "..", "images")

# Specify the output style/environment
output_style = :expanded #:compressed
environment = :development #:production


