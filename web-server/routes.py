import os

from settings import config
import api_models as am

def rescan(app):
    series_lookup = {}
    series_list = []
    game_lookup = {}
    game_list = []
    song_lookup = {}
    song_list = []

    for root,dirs,files in os.walk(config.media_dir):
        for ff in files:
            file_path = os.path.join(root,ff)
            chop = file_path.replace(config.media_dir+'/','')
            parts = chop.split('/')

            if len(parts) < 3:
                continue

            series = parts[0]
            if not series in series_lookup:
                series_lookup[series] = {}
                series_list.append(series)

            game = parts[1]
            if not game in game_lookup:
                game_lookup[game] = {}
                game_list.append(game)
            series_lookup[series][game] = game

            song = parts[2]
            if not song in song_lookup:
                song_lookup[song] = True
                song_list.append(song)
            game_lookup[game][song] = file_path

    series_list.sort()
    game_list.sort()
    song_list.sort()

    app.state.list = {
        'series': series_list,
        'game': game_list,
        'song': song_list
    }

    app.state.lookup = {
        'series': series_lookup,
        'game': game_lookup,
        'song': song_lookup
    }

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
        return app.state.list['series']

    @router.get("/game/list")
    def get_game_list(series_name:str):
        result = list(app.state.lookup['series'][series_name].keys())
        result.sort()
        return result

    @router.get('/song/list')
    def get_song_list(game_name:str):
        result = list(app.state.lookup['game'][game_name].keys())
        result.sort()
        return result


    return router

