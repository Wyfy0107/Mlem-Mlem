#!/bin/bash

password=secret
db_name=mlem

docker run -e POSTGRES_PASSWORD="${password}" -e POSTGRES_DB="${db_name}" -p 5432:5432 --rm postgres