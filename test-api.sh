#!/bin/bash

echo "=== Testing Tagging & Search API ==="
echo ""

echo "1. Health Check"
curl -s http://localhost:3000/health | jq '.'
echo ""
echo ""

echo "2. Search entities with 'mongodb' tag (OR mode)"
curl -s "http://localhost:3000/entities/search?tags=mongodb&mode=or&limit=2" | jq '.entities[] | {id, entityType, title}'
echo ""
echo ""
