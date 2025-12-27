#!/bin/bash
# Load .env file and export variables, then run the command

set -a  # automatically export all variables
[ -f .env ] && source .env
set +a

# Execute the command passed as arguments
exec "$@"
