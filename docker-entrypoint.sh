#!/bin/sh

# Abort on any error (including if wait-for-it fails).
set -e

# Wait for the backend to be up, if we know where it is.
if [ -n "$MessageQueueBroker" ]; then
  /usr/src/app/wait-for-it.sh "$MessageQueueBroker" -t 60
fi

# Run the main container command.
exec "$@"