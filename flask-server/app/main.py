from flask import Flask, request
from lyricsgenius import Genius
from flask_cors import CORS
import text2emotion as te
import nltk

app = Flask(__name__)
CORS(app)
nltk.download('omw-1.4')

@app.route("/")
def hello():
    return "Sentiment Analysis Server"

@app.route("/sentiment", methods = ['POST'])
def get_sentiment():
    body = request.get_json()
    title = body['name']
    artists = ""
    for artist in body['artists']:
        artists += artist['name'] + ", "
        artists = artists[:-2]
        body['artists'] = artists
    try:
        # get lyrics
        genius = Genius("yjb9l2s98hgHZLc7U4Asex-ODR3QrjZW1DlTa30oHSDcOUzn7KvQiXl6hNAP3Y9z")
        genius_song = genius.search_song(title, artists)
        lyrics = genius_song.lyrics
        # find emotion of song and attach it
        values = te.get_emotion(lyrics)
        body['moods'] = values
    except:
        body['moods'] = "N/A"    
    return body