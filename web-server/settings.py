import os
import sys


class Config:
    def __init__(self):
        self.server_version = "1.1.0"
        self.server_build_date = "October 23, 2025"
        self.server_build_dev_number = 1
        self.app_data_dir = '.snowjam/'
        self.display_config = None
        self.frontend_url = "http://localhost:3000"
        self.is_deployed_environment = None
        self.web_api_url = "http://localhost:8000"
        self.web_media_url = "<need_to_set_an_env_var-SNOWJAM_WEB_MEDIA_URL>"
        self.log_file_path = '.snowjam/log/snowjam.log'

        self.media_dir = "/mnt/j-media/snowjam"

    def validate(self, log):
        if not self.web_media_url or 'SNOWJAM_WEB_MEDIA_URL' in self.web_media_url:
            log.error("SNOWJAM_WEB_MEDIA_URL environment variable must be set.")
            log.error("example: http://<host-ip>:9064/mnt")
            log.error("Exiting")
            sys.exit(1)
        if self.display_config:
            self.display(log)

    def display(self, log):
        log.info("Current server config")
        for key, val in vars(self).items():
            log.info(f"\t{key} = {val}")


config = Config()

for key, val in vars(config).items():
    env_var_key = f"SNOWJAM_{key.upper()}"
    env_var_value = os.environ.get(env_var_key)
    if env_var_value:
        setattr(config, key, env_var_value)

os.makedirs(config.log_file_path.replace("/snowjam.log",""),exist_ok=True)