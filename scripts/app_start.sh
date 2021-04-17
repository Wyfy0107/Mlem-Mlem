#!/usr/bin/env bash

cd /home/ubuntu/app
pm2 start main.js --name mlem-mlem-backend
sudo systemctl restart nginx