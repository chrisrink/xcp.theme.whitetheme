#configurations
 
#Need to manually add compass load path here
#It should be dynamically discovered by RubyGems
#Seems like caused by OSGI class loader issue

$LOAD_PATH << "#{$jruby_jar_path}!/gems/sass-3.1.7/lib"
$LOAD_PATH << "#{$jruby_jar_path}!/gems/chunky_png-1.2.4/lib"
$LOAD_PATH << "#{$jruby_jar_path}!/gems/fssm-0.2.7/lib"
$LOAD_PATH << "#{$jruby_jar_path}!/gems/compass-0.11.5/lib"
 