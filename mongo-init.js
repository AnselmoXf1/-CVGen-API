// MongoDB initialization script
db = db.getSiblingDB('cvgen-api');

// Create collections
db.createCollection('users');
db.createCollection('templates');
db.createCollection('cvs');
db.createCollection('apilogs');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "apiKeys.key": 1 });
db.users.createIndex({ "role": 1, "isActive": 1 });

db.templates.createIndex({ "name": 1 });
db.templates.createIndex({ "category": 1, "isActive": 1 });
db.templates.createIndex({ "isPremium": 1, "isActive": 1 });

db.cvs.createIndex({ "userId": 1, "createdAt": -1 });
db.cvs.createIndex({ "fileName": 1 });
db.cvs.createIndex({ "status": 1 });

db.apilogs.createIndex({ "userId": 1, "createdAt": -1 });
db.apilogs.createIndex({ "apiKey": 1, "createdAt": -1 });
db.apilogs.createIndex({ "endpoint": 1, "createdAt": -1 });

print('Database initialized successfully!');