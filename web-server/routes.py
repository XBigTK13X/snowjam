import os
import uuid

from settings import config
import api_models as am

import hashlib

def hash(input):
    return hashlib.md5(input.encode()).hexdigest()


def rescan(app):
    lookup = {
        'series_list': [],
        'series_id': {},
        'series_reverse': {},
        'game_id': {},
        'game_reverse': {},
        'song_id': {},
        'song_reverse': {}
    }

    for root,dirs,files in os.walk(config.media_dir):
        for ff in files:
            file_path = os.path.join(root,ff)
            chop = file_path.replace(config.media_dir+'/','')
            parts = chop.split('/')

            if len(parts) < 3:
                continue

            series = parts[0]
            series_id = None
            if not series in lookup['series_id']:
                series_id = hash(series)
                lookup['series_id'][series] = series_id
                lookup['series_reverse'][series_id] = series
                lookup[series_id] = {}
                lookup['series_list'].append({'name':series, 'id': series_id})
                lookup['series_list'].sort(key=lambda xx: xx['name'])
            else:
                series_id = lookup['series_id'][series]

            game = parts[1]
            if not 'game_list' in lookup[series_id]:
                lookup[series_id]['game_list'] = []
            game_id = None
            game_key = series+game
            if not game_key in lookup['game_id']:
                game_id = hash(game)
                lookup['game_id'][game_key] = game_id
                lookup['game_reverse'][game_id] = game
                lookup[series_id][game_id] = {}
                lookup[series_id]['game_list'].append({'name':game,'id': game_id})
                lookup[series_id]['game_list'].sort(key=lambda xx: xx['name'])
            else:
                game_id = lookup['game_id'][game_key]

            song = parts[2]
            if not 'song_list' in lookup[series_id][game_id]:
                lookup[series_id][game_id]['song_list'] = []
            song_id = None
            song_key = series+game+song
            if not song_key in lookup['song_id']:
                song_id = hash(song)
                lookup['song_id'][song_key] = song_id
                lookup['song_reverse'][song_id] = song
                lookup[series_id][game_id][song_id] = {}
                lookup[series_id][game_id]['song_list'].append({'name':song, 'id': song_id})
                lookup[series_id][game_id]['song_list'].sort(key=lambda xx: xx['name'])
            else:
                song_id = lookup['song_id'][song_key]

            kind = 'pdf'
            if '.mid' in file_path:
                kind = 'midi'
            elif '.mus' in file_path:
                kind = 'mus'
            lookup[series_id][game_id][song_id][kind] = file_path

    app.state.lookup = lookup

def register(app,router):
    rescan(app)

    @router.get("/heartbeat")
    def heartbeat():
        return {"alive": True}

    @router.get("/info")
    def info():
        return {
            "serverVersion": config.server_version,
            "serverBuildDate": config.server_build_date,
        }

    @router.post('/scan')
    def scan():
        rescan()

    @router.get("/series/list")
    def get_series_list():
        return app.state.lookup['series_list']

    @router.get("/game/list")
    def get_game_list(series_id:str):
        return {
            'game_list': app.state.lookup[series_id]['game_list'],
            'series': app.state.lookup['series_reverse'][series_id]
        }

    @router.get('/song/list')
    def get_song_list(series_id:str,game_id:str):
        return {
            'song_list': app.state.lookup[series_id][game_id]['song_list'],
            'game': app.state.lookup['game_reverse'][game_id],
            'series': app.state.lookup['series_reverse'][series_id]
        }

    @router.get('/song')
    def get_song_details(series_id:str,game_id:str,song_id:str):
        return {
            'details': app.state.lookup[series_id][game_id][song_id],
            'song': app.state.lookup['song_reverse'][song_id],
            'game': app.state.lookup['game_reverse'][game_id],
            'series': app.state.lookup['series_reverse'][series_id]
        }
    return router

