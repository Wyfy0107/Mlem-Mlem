#!/usr/bin/env bash

pm2 stop mlem-mlem-backend || echo "already stopped"
pm2 delete mlem-mlem-backend  || echo "already removed"