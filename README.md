xcp.theme.whitetheme
====================

xCP 2.0 White theme
I build the xCP 2.0 White Theme for two reason. 
1. I didn't like the current xCP 2.0 theme. So I wanted to make a better one.
2. Making the theme was hard, so I wanted to build a utility to make it easier to build a theme.

If you just want the white theme, grab the thm.WhiteTheme-1.0.jar and add as a library. Boom - you are done. 

If you want to take that theme and extend it, then follow the steps below:

How to install in Windows
1.Get a package installer - Chocolatey (http://chocolatey.org/)  or Run this in a command line
'''
C:\> @powershell -NoProfile -ExecutionPolicy unrestricted -Command "iex ((new-object net.webclient).DownloadString('http://bit.ly/psChocInstall'))" && SET PATH=%PATH%;%systemdrive%\chocolatey\bin
'''
2. Get ruby
'''
c:\> cinst ruby
'''
3. Get Yeoman
'''
c:\> cinst yeoman
'''
There are a ton of awesome utilities/dependancies that Yeoman needs. I honestly forget if it cinst gets dependancies, if not you you will need to cinst install the following:
a.Compass (≥ 0.12.2)
b.git
c.nodejs.install (≥ 0.8.1)
d.libjpeg-turbo (≥ 1.2.1)
e.OptiPNG (≥ 0.7.1)
f.PhantomJS (≥ 1.6.1)
g.python

4. Get Git
'''
cinst git.install
'''
5. Go to you're favorite location for projects and run:
'''
git clone https://github.com/chrisrink/xcp.theme.whitetheme.git
'''

How to install in MacOS
1. Get a package installer: Homebrew (http://mxcl.github.com/homebrew/) or run this from a terminal
'''
ruby -e "$(curl -fsSkL raw.github.com/mxcl/homebrew/go)"
'''

2. Install Yeoman (http://yeoman.io/)
'''
(curl -L get.yeoman.io | bash)
'''

3. Install Git (http://github/)
'''
brew install git
'''
4. Go to you're favorite location for projects and run:
'''
git clone https://github.com/chrisrink/xcp.theme.whitetheme.git
'''

Once everything is installed, open a terminal in the project location and run
'''
yeoman server
'''

A browser window will pop up with a quick page navigator. This is a preview of the updated theme.
To edit the theme, edit the file ''' app/styles/scss/white-theme.scss'''

Yeoman will compile the scss code on the fly and update the browser page with the updates. Sweet! 

To add more pages, Create an appliation in xCP, deploy. This generates a "page" that you can them consume. The page will be located in the target/app_name/pages folder. Grab that file and put it in teh app/scripts/pages directory. You will need to rename the labels and probably remove any actionhandlers/expression syntax.

have a question, let me know.
Chris