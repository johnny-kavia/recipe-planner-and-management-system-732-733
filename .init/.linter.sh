#!/bin/bash
cd /Users/johnnytorres/kavia/_workspace/code-generation/recipe-planner-and-management-system-732-733/nextjs_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

