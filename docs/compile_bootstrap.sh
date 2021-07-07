rm -rf bootstrap/
git clone https://github.com/twbs/bootstrap
rm bootstrap/scss/_variables.scss
cp _variables.scss bootstrap/scss/
sass bootstrap/scss/bootstrap.scss bootstrap.css
curl -X POST -s --data-urlencode 'input@bootstrap.css' https://cssminifier.com/raw > css/bootstrap.min.css
rm bootstrap.css*
