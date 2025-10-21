#! /bin/bash

echo "Launching the web api"
uvicorn --fd 0 bin.server:app