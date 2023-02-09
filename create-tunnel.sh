#!/bin/bash

export $(grep -v '^#' .env | xargs)

ssh -i  ${SCHEMA_SSH_PRIVATE_KEY} -nNT -L 5432:${SCHEMA_DB_HOST}:3306 ${SCHEMA_SSH_USERNAME}@${SCHEMA_SSH_HOST}

