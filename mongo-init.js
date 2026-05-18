// MongoDB initialization script
db = db.getSiblingDB('smarthome');

db.createCollection('rooms');
db.createCollection('devices');
db.createCollection('readings');

print('SmartHome database initialized.');
