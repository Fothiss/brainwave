#!/bin/bash

python manage.py makemigrations operations  || true
python manage.py migrate

exec "$@"