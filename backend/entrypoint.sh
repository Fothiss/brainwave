#!/bin/bash

python manage.py makemigrations chat  || true
python manage.py makemigrations mermaid  || true
python manage.py migrate

exec "$@"