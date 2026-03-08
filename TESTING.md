# Testing Guide

## Quick Test

Run the automated test script:

```bash
./test-api.sh
```

This tests all core functionality:
- Health check
- Search

## Manual Testing

### 1. Start the Server

```bash
npm run seed  # Seed database
npm run dev   # Start server
```

### 2. Test Search (OR Mode)

```bash
curl "http://localhost:3000/entities/search?tags=mongodb,database&mode=or"
```

Expected: Returns entities tagged with mongodb OR database

### 3. Test Search (AND Mode)

```bash
curl "http://localhost:3000/entities/search?tags=mongodb,database&mode=and"
```

Expected: Returns only entities tagged with BOTH mongodb AND database

### 4. Test Entity Type Filter

```bash
curl "http://localhost:3000/entities/search?tags=mongodb&entityType=snippet"
```

Expected: Returns only snippets tagged with mongodb

### 5. Test Pagination

```bash
curl "http://localhost:3000/entities/search?tags=mongodb&page=1&limit=2"
curl "http://localhost:3000/entities/search?tags=mongodb&page=2&limit=2"
```

Expected: Different results on each page

### 6. Test Tag Analytics

```bash
curl "http://localhost:3000/tags/analytics"
```

Expected: Returns total usage, usage by entity type, and top tags

### 7. Test Time-Based Analytics

```bash
curl "http://localhost:3000/tags/analytics?days=7"
```

Expected: Returns analytics for last 7 days only

### 8. Test Tag Attachment

```bash
curl -X POST http://localhost:3000/tags/attach \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "YOUR_ENTITY_ID",
    "entityType": "source",
    "tags": ["new-tag", "another-tag"]
  }'
```

Expected: `{"success": true, "message": "Tags attached successfully"}`

### 9. Test Tag Normalization

```bash
curl -X POST http://localhost:3000/tags/attach \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "YOUR_ENTITY_ID",
    "entityType": "source",
    "tags": ["  MongoDB  ", "MONGODB", "mongodb"]
  }'
```

Expected: Only one "mongodb" tag attached (normalized and deduplicated)

### 10. Test Idempotency

Attach the same tags twice:

```bash
curl -X POST http://localhost:3000/tags/attach \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "YOUR_ENTITY_ID",
    "entityType": "source",
    "tags": ["test-tag"]
  }'

# Run again
curl -X POST http://localhost:3000/tags/attach \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "YOUR_ENTITY_ID",
    "entityType": "source",
    "tags": ["test-tag"]
  }'
```

Expected: Both requests succeed, but tag is only attached once

### 11. Test Tag Limit

```bash
curl -X POST http://localhost:3000/tags/attach \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "YOUR_ENTITY_ID",
    "entityType": "source",
    "tags": ["tag1", "tag2", "tag3", ..., "tag25"]
  }'
```

Expected: `{"error": "Tag limit exceeded. Maximum 20 tags per entity allowed."}`

### 12. Test Error Handling

Invalid entity type:
```bash
curl -X POST http://localhost:3000/tags/attach \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "YOUR_ENTITY_ID",
    "entityType": "invalid",
    "tags": ["test"]
  }'
```

Expected: `{"error": "Invalid entityType. Must be one of: source, snippet, airesponse"}`

Non-existent entity:
```bash
curl -X POST http://localhost:3000/tags/attach \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "000000000000000000000000",
    "entityType": "source",
    "tags": ["test"]
  }'
```

Expected: `{"error": "Entity not found"}`
