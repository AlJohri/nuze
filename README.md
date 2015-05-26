# NUze

## Usage

```
workon nuze
source .secret
python scraper.py
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
