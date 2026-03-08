# Multi-Entity Tagging & Semantic Search Backend

A backend API system for tagging and searching entities (Sources, Snippets, AIResponses) with support for system-generated and user-generated tags.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB with Mongoose

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tagging-search
MAX_TAGS_PER_ENTITY=20
```

## Running the Application

```bash
# Seed database
npm run seed

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## API Endpoints

### 1. Attach Tags to Entity

```
POST /tags/attach
```

Request:
```json
{
  "entityId": "507f1f77bcf86cd799439011",
  "entityType": "source",
  "tags": ["mongodb", "database"]
}
```

Response:
```json
{
  "success": true,
  "message": "Tags attached successfully"
}
```

### 2. Search Entities by Tags

```
GET /entities/search?tags=mongodb,database&mode=and&page=1&limit=20
```

Query parameters:
- `tags` (required): Comma-separated list
- `mode` (optional): "and" or "or" (default: "or")
- `entityType` (optional): Filter by type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

### 3. Tag Analytics

```
GET /tags/analytics?days=30
```

Returns total usage, usage by entity type, and top tags.

## Answers From Assignment

### Why did you choose this schema?

**Single Entity Collection**

One collection for all entity types (Source, Snippet, AIResponse) with an `entityType` field:

- Easy to add new types - just update the enum, no database changes
- All entities in one place
- `metadata` field stores type-specific data flexibly

**Separate EntityTag Collection**

Tags stored separately, linked via EntityTag collection:

- Each tag stored once, no duplicates
- Fast searches using indexes
- Easy to count tag usage
- `tagName` copied to EntityTag for faster queries

**Trade-offs**:
- Writes touch 3 collections (slower)
- Reads are fast (indexed)
- Tags stay consistent

### How do tag searches work internally?

**OR Mode** (`tags=mongodb,database&mode=or`):

1. Find EntityTag documents where tagName is "mongodb" OR "database"
2. Group by entityId
3. Return unique entities

**AND Mode** (`tags=mongodb,database&mode=and`):

1. Find EntityTag documents where tagName is "mongodb" OR "database"
2. Group by entityId and count matches
3. Keep only entities where count equals number of search tags
4. Return entities

Uses MongoDB aggregation pipeline with indexes for fast queries.

### How would you extend search to surface semantically related tags?

**The Problem**: When searching "mongodb", should results include content tagged "database" or "nosql"?

**Tag Hierarchy**

```
database (parent)
├── mongodb
├── postgresql
└── nosql
```

- Add `parentTagId` to Tag model
- Search includes parent and sibling tags
- Simple, predictable, low latency
- Needs manual setup

### Where does this system break first under scale?

**1. Tag Search (100K+ entities)**

Problem: Aggregation pipeline slows down

Fix:
- Cache popular searches in Redis
- Pre-compute tag counts

**2. Popular Tags**

Problem: Many users tagging with "mongodb" at once causes lock contention

Fix:
- Write-behind caching

**3. Analytics**

Problem: Real-time aggregations get slow

Fix:
- Pre-aggregate counts in separate collection
- Update async via change streams
- Use time-series collections

**4. Tag Explosion**

Problem: Users create "js", "JS", "JavaScript", "java-script"

Current: Max 20 tags per entity

Better:
- Autocomplete from existing tags
- Fuzzy matching on creation
- Admin-curated canonical tags

**5. Index Size**

Problem: Compound indexes grow large with high cardinality

Fix:
- Archive old EntityTag records
- Partition by date

### What would you improve with more time?

1. Tag hierarchy for semantic search
2. Redis caching for popular searches
3. Tag autocomplete to prevent duplicates
4. Soft deletes with async cleanup
5. Rate limiting on tag attachment
6. Admin endpoint to merge similar tags