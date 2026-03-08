import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Entity } from '../models/Entity';
import { Tag } from '../models/Tag';
import { EntityTag } from '../models/EntityTag';

const seedData = async (): Promise<void> => {
  try {
    await connectDatabase();

    await EntityTag.deleteMany({});
    await Entity.deleteMany({});
    await Tag.deleteMany({});

    console.log('Creating tags...');
    const tagData = [
      'mongodb',
      'database',
      'nosql',
      'javascript',
      'typescript',
      'nodejs',
      'backend',
      'api',
      'rest',
      'express',
      'tutorial',
      'guide',
      'performance',
      'optimization',
      'security',
      'authentication',
      'authorization',
      'indexing',
      'query-optimization',
      'interview-prep',
    ];

    const tags = await Tag.insertMany(tagData.map((name) => ({ name })));
    const tagMap = new Map(tags.map((tag) => [tag.name, tag]));

    console.log('Creating entities...');

    // Source 1: YouTube video (system-generated tags from YouTube API simulation)
    const source1 = await Entity.create({
      entityType: 'source',
      title: 'MongoDB Performance Optimization Guide',
      content: 'A comprehensive guide to optimizing MongoDB queries and indexes for better performance...',
      metadata: {
        url: 'https://youtube.com/watch?v=example1',
        type: 'youtube',
        author: 'Tech Channel',
        duration: '25:30',
        // Simulated YouTube API response
        youtubeCategories: ['Education'],
        youtubeTopics: ['database', 'mongodb', 'backend'],
        youtubeKeywords: ['mongodb', 'performance', 'optimization', 'indexing'],
      },
    });

    // Source 2: Article (system-generated tags from article metadata)
    const source2 = await Entity.create({
      entityType: 'source',
      title: 'Building REST APIs with Express and TypeScript',
      content: 'Learn how to build scalable REST APIs using Express.js and TypeScript with best practices...',
      metadata: {
        url: 'https://example.com/express-typescript-api',
        type: 'article',
        author: 'John Doe',
        publishedDate: '2024-01-15',
        // Simulated article metadata tags
        articleTags: ['express', 'typescript', 'nodejs', 'api', 'rest', 'backend'],
      },
    });

    // Source 3: PDF (system-generated tags from PDF metadata)
    const source3 = await Entity.create({
      entityType: 'source',
      title: 'NoSQL Database Design Patterns',
      content: 'Explore common design patterns for NoSQL databases including MongoDB, Cassandra, and DynamoDB...',
      metadata: {
        url: 'https://example.com/nosql-patterns.pdf',
        type: 'pdf',
        pages: 120,
        // Simulated PDF metadata tags
        pdfKeywords: ['mongodb', 'nosql', 'database', 'guide'],
      },
    });

    // Snippet 1: User highlight from Source 1 (inherits system tags + user adds more)
    const snippet1 = await Entity.create({
      entityType: 'snippet',
      title: 'MongoDB Index Best Practices',
      content: 'Always create compound indexes for queries that filter on multiple fields. Single-field indexes are not enough for complex queries.',
      metadata: {
        sourceId: source1._id.toString(),
        page: 15,
        highlightedBy: 'user123',
        timestamp: '12:45',
      },
    });

    // Snippet 2: User highlight from Source 2
    const snippet2 = await Entity.create({
      entityType: 'snippet',
      title: 'Express Middleware Pattern',
      content: 'Use middleware functions to handle authentication and authorization before reaching route handlers.',
      metadata: {
        sourceId: source2._id.toString(),
        highlightedBy: 'user123',
      },
    });

    // Snippet 3: User highlight from Source 3
    const snippet3 = await Entity.create({
      entityType: 'snippet',
      title: 'Database Security Checklist',
      content: 'Enable authentication, use SSL/TLS, implement role-based access control, and regularly audit access logs.',
      metadata: {
        sourceId: source3._id.toString(),
        page: 45,
        highlightedBy: 'user456',
      },
    });

    // AIResponse 1: AI-generated answer
    const aiResponse1 = await Entity.create({
      entityType: 'airesponse',
      title: 'How to optimize MongoDB queries?',
      content:
        'To optimize MongoDB queries: 1) Create appropriate indexes for frequently queried fields, 2) Use projection to limit returned fields, 3) Avoid large skip values in pagination, 4) Use covered queries when possible.',
      metadata: {
        model: 'gpt-4',
        prompt: 'How can I optimize my MongoDB queries?',
        generatedAt: new Date().toISOString(),
      },
    });

    // AIResponse 2: AI-generated answer
    const aiResponse2 = await Entity.create({
      entityType: 'airesponse',
      title: 'Explain Express.js middleware',
      content:
        'Express.js middleware are functions that have access to request and response objects. They can execute code, modify req/res objects, end the request-response cycle, or call the next middleware.',
      metadata: {
        model: 'gpt-4',
        prompt: 'Can you explain Express.js middleware?',
        generatedAt: new Date().toISOString(),
      },
    });

    // AIResponse 3: AI-generated answer
    const aiResponse3 = await Entity.create({
      entityType: 'airesponse',
      title: 'TypeScript vs JavaScript for backend',
      content:
        'TypeScript provides static typing which catches errors at compile time, better IDE support, improved code maintainability, and enhanced refactoring capabilities compared to JavaScript.',
      metadata: {
        model: 'gpt-4',
        prompt: 'Should I use TypeScript or JavaScript for backend development?',
        generatedAt: new Date().toISOString(),
      },
    });

    console.log('Attaching tags to entities...');

    const entityTagData = [
      // Source 1: System-generated tags from YouTube API
      { entity: source1, tags: ['mongodb', 'database', 'backend', 'performance', 'optimization', 'indexing'] },
      
      // Source 2: System-generated tags from article metadata
      { entity: source2, tags: ['express', 'typescript', 'nodejs', 'api', 'rest', 'backend', 'tutorial'] },
      
      // Source 3: System-generated tags from PDF metadata
      { entity: source3, tags: ['mongodb', 'nosql', 'database', 'guide'] },
      
      // Snippet 1: Inherits parent Source tags + user adds 'interview-prep'
      { entity: snippet1, tags: ['mongodb', 'database', 'performance', 'optimization', 'indexing', 'interview-prep'] },
      
      // Snippet 2: Inherits parent Source tags + user adds 'authentication', 'authorization'
      { entity: snippet2, tags: ['express', 'nodejs', 'backend', 'authentication', 'authorization'] },
      
      // Snippet 3: User manually adds security-related tags
      { entity: snippet3, tags: ['database', 'security', 'mongodb', 'nosql'] },
      
      // AIResponse 1: System-generated based on AI response content
      { entity: aiResponse1, tags: ['mongodb', 'database', 'performance', 'optimization', 'query-optimization'] },
      
      // AIResponse 2: System-generated based on AI response content
      { entity: aiResponse2, tags: ['express', 'nodejs', 'backend', 'api'] },
      
      // AIResponse 3: System-generated based on AI response content
      { entity: aiResponse3, tags: ['typescript', 'javascript', 'nodejs', 'backend'] },
    ];

    for (const { entity, tags: tagNames } of entityTagData) {
      const entityTags = tagNames.map((tagName) => {
        const tag = tagMap.get(tagName);
        if (!tag) throw new Error(`Tag not found: ${tagName}`);
        return {
          entityId: entity._id,
          entityType: entity.entityType,
          tagId: tag._id,
          tagName: tag.name,
        };
      });
      await EntityTag.insertMany(entityTags);
    }

    console.log('Seed data created successfully!');
    console.log(`- ${tags.length} tags`);
    console.log(`- 9 entities (3 sources, 3 snippets, 3 AI responses)`);
    console.log('- System-generated tags simulated in metadata');
    console.log('- User-generated tags added to snippets');
    console.log('- Tags with overlapping relationships for meaningful search');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
