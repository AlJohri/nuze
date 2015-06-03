# NUze

## Usage

```
workon nuze
export $(cat .secret | xargs)
python scraper.py
open index.html
```

OR

```
workon nuze
foreman start -e .secret
open index.html
```

## Setup
```
mkvirtualenv nuze
pip install -r requirements.txt
cp .secret.example .secret
# edit .secret to add api keys
```

## Backend Links
- http://nuze.herokuapp.com/instagram
- http://nuze.herokuapp.com/twitter

## Deploy
```
heroku config:push --overwrite -e .secret
```

## Clear Firebase Database
**Warning**: Don't run this unless you actually need to!!
```
curl -X DELETE  'https://aljohri-nutopyak.firebaseio.com/yaks.json'
```