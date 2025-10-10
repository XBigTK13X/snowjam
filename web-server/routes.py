import cache
import json
import util
import uuid
import os
from datetime import datetime, timezone

from fastapi import Response, Request
from fastapi import Security
from fastapi.responses import PlainTextResponse

from auth import get_current_user
from db import db
from log import log
from settings import config
from snow_media.transcode_sessions import transcode_sessions
from typing import Annotated
import api_models as am
import message.write
import snow_media

def register(router):
    router = no_auth_required(router)

def no_auth_required(router):
    @router.get("/heartbeat",tags=['Unauthed'])
    def heartbeat():
        return {"alive": True}

    @router.get("/info",tags=['Unauthed'])
    def info():
        return {
            "serverVersion": config.server_version,
            "serverBuildDate": config.server_build_date,
        }

    @router.get("/password/hash",tags=['Unauthed'])
    def password_hash(password: str):
        return util.get_password_hash(password)


    @router.get("/user/list",tags=['Unauthed'])
    def get_user_list(device_profile:str=None):
        device = snow_media.device.get_device(device_profile)
        users = db.op.get_user_list()
        results = []
        admin = None
        for user in users:
            user.hashed_password = None
            if user.username == 'admin':
                admin = user
            else:
                if not device.require_password:
                    user.has_password = False
                results.append(user)
        results.append(admin)

        return results

    @router.get("/streamable.m3u", response_class=PlainTextResponse,tags=['Unauthed Video'])
    def get_streamable_m3u():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_M3U)

    @router.get("/streamable.xml", response_class=PlainTextResponse,tags=['Unauthed Video'])
    def get_streamable_epg():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_EPG)

    @router.get("/transcode/playlist.m3u8",tags=['Unauthed Video'])
    @router.head("/transcode/playlist.m3u8",tags=['Unauthed Video'])
    def get_transcode_playlist(transcode_session_id:int):
        playlist_content = transcode_sessions.get_playlist_content(transcode_session_id=transcode_session_id)
        return Response(playlist_content, status_code=200, media_type="video/mp4")

    @router.get("/transcode/segment",tags=['Unauthed Video'])
    @router.head("/transcode/segment",tags=['Unauthed Video'])
    def get_transcode_file_segment(transcode_session_id: int, segment_file: str):
        segment = transcode_sessions.get_stream_segment(
            transcode_session_id=transcode_session_id, segment_file=segment_file
        )
        return Response(segment, status_code=200, media_type="video/mp4")

    async def webhook(kind:str, request:Request):
        headers = dict(request.headers)
        if not 'apikey' in headers or headers['apikey'] != 'scanner':
            return False
        body = await request.json()
        is_show = kind == 'show' and 'series' in body and 'path' in body['series']
        is_movie = kind == 'movie' and 'movie' in body and 'folderPath' in body['movie']
        if is_movie or is_show:
            metadata_id = None
            directory = None
            if is_show:
                directory = body['series']['path']
                if 'testpath' in directory:
                    return True
                if 'tvdbId' in body['series'] and body['series']['tvdbId'] != None:
                    metadata_id = int(body['series']['tvdbId'])
            else:
                directory = body['movie']['folderPath']
                if 'testpath' in directory:
                    return True
                if 'tmdbId' in body['movie'] and body['movie']['tmdbId'] != None:
                    metadata_id = int(body['movie']['tmdbId'])
            input = {
                'target_kind': 'directory',
                'target_directory': directory,
            }
            if metadata_id:
                input['metadata_id'] = metadata_id
                input['spawn_subjob'] = 'update_media_files'
            scan_job = db.op.create_job(kind='scan_shelves_content',input=input)
            message.write.send(job_id=scan_job.id, kind='scan_shelves_content', input=input)
        else:
            log.info("Unable to process webhook")
            log.info("Header")
            log.info(json.dumps(headers,indent=4))
            log.info("Body")
            log.info(json.dumps(body,indent=4))
            return False

    # https://github.com/Sonarr/Sonarr/blob/14e324ee30694ae017a39fd6f66392dc2d104617/src/NzbDrone.Core/Notifications/Webhook/WebhookBase.cs#L32
    @router.post("/hook/sonarr", tags=['Unauthed'])
    async def hook_sonarr(request:Request):
        return await webhook(kind='show', request=request)

    # https://github.com/Radarr/Radarr/blob/159f5df8cca6704fe88da42d2b20d1f39f0b9d59/src/NzbDrone.Core/Notifications/Webhook/WebhookBase.cs#L32
    @router.post("/hook/radarr", tags=['Unauthed'])
    async def hook_radarr(request:Request):
        return await webhook(kind='movie', request=request)

    return router
