// Seed script to populate MongoDB Places collection with Sri Lankan attractions
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'trip_planner';

// Complete list of Sri Lankan tourist attractions
const places = [
  { placeId: "sigiriya", name: "Sigiriya Rock Fortress", district: "Matale", category: "Historical Sites", lat: 7.957, lng: 80.760, description: "Ancient rock fortress with frescoes and panoramic views.", estimatedCost: 3000 },
  { placeId: "polonnaruwa", name: "Polonnaruwa Ancient City", district: "Polonnaruwa", category: "Historical Sites", lat: 7.939, lng: 81.000, description: "UNESCO site with well-preserved ruins and stupas.", estimatedCost: 1500 },
  { placeId: "anuradhapura", name: "Anuradhapura", district: "Anuradhapura", category: "Historical Sites", lat: 8.312, lng: 80.403, description: "Ancient sacred city with large stupas and Buddha images.", estimatedCost: 1200 },
  { placeId: "dambulla_cave", name: "Dambulla Cave Temple", district: "Matale", category: "Religious Sites", lat: 7.859, lng: 80.652, description: "Cave temple complex with Buddhist murals and statues.", estimatedCost: 800 },

  { placeId: "kandy_temple", name: "Temple of the Tooth (Kandy)", district: "Kandy", category: "Religious Sites", lat: 7.290, lng: 80.636, description: "Sacred Buddhist temple housing Buddha's tooth relic.", estimatedCost: 800 },
  { placeId: "peradeniya", name: "Royal Botanical Gardens (Peradeniya)", district: "Kandy", category: "Cultural Experiences", lat: 7.293, lng: 80.607, description: "Large, historic botanical gardens with diverse plant collections.", estimatedCost: 600 },

  { placeId: "galle_fort", name: "Galle Fort", district: "Galle", category: "Historical Sites", lat: 6.024, lng: 80.217, description: "Dutch colonial fort with museums, cafes and sea views.", estimatedCost: 500 },
  { placeId: "mirissa", name: "Mirissa Beach", district: "Matara", category: "Beaches", lat: 5.948, lng: 80.461, description: "Popular beach for sunbathing, whale watching and surf.", estimatedCost: 0 },
  { placeId: "unawatuna", name: "Unawatuna Beach", district: "Galle", category: "Beaches", lat: 5.941, lng: 80.252, description: "Calm bay with coral reefs and relaxed atmosphere.", estimatedCost: 0 },

  { placeId: "ella_rock", name: "Ella Rock", district: "Badulla", category: "Hill Country", lat: 6.873, lng: 81.040, description: "Scenic hike with panoramic views over tea country.", estimatedCost: 0 },
  { placeId: "nuwara_eliya", name: "Nuwara Eliya (Tea Plantations)", district: "Nuwara Eliya", category: "Tea Plantations", lat: 6.949, lng: 80.789, description: "Cool hill town surrounded by tea estates and waterfalls.", estimatedCost: 0 },
  { placeId: "horton_plains", name: "Horton Plains & World's End", district: "Nuwara Eliya", category: "Hill Country", lat: 6.800, lng: 80.800, description: "National park famous for World's End cliff and biodiversity.", estimatedCost: 500 },

  { placeId: "adam_peak", name: "Adam's Peak (Sri Pada)", district: "Nallathanniya", category: "Religious Sites", lat: 6.966, lng: 80.454, description: "Pilgrimage mountain known for sunrise views and sacred footprint.", estimatedCost: 0 },
  { placeId: "ella_little_adam", name: "Little Adam's Peak", district: "Badulla", category: "Hill Country", lat: 6.865, lng: 81.043, description: "Easier hike with panoramic views near Ella.", estimatedCost: 0 },

  { placeId: "yala_np", name: "Yala National Park", district: "Hambantota", category: "Wildlife", lat: 6.361, lng: 81.529, description: "Popular national park for leopard safaris and wildlife.", estimatedCost: 8000 },
  { placeId: "udawalawe", name: "Udawalawe National Park", district: "Ratnapura", category: "Wildlife", lat: 6.462, lng: 81.003, description: "Elephant sightings and safari tours.", estimatedCost: 6000 },

  { placeId: "trincomalee", name: "Trincomalee (Nilaveli, Pigeon Island)", district: "Trincomalee", category: "Beaches", lat: 8.587, lng: 81.215, description: "Golden beaches, snorkeling and marine life.", estimatedCost: 0 },
  { placeId: "arugam_bay", name: "Arugam Bay", district: "Ampara", category: "Adventure Sports", lat: 6.840, lng: 81.855, description: "World-class surfing spot on the east coast.", estimatedCost: 0 },

  { placeId: "colombo_galleface", name: "Colombo & Galle Face Green", district: "Colombo", category: "Cultural Experiences", lat: 6.927, lng: 79.848, description: "Capital city with colonial buildings and sea promenade.", estimatedCost: 0 },
  { placeId: "negombo", name: "Negombo Beach & Lagoon", district: "Negombo", category: "Beaches", lat: 7.206, lng: 79.829, description: "Popular beach near the airport with seafood markets.", estimatedCost: 0 },

  { placeId: "jafna", name: "Jaffna Fort & Jaffna", district: "Jaffna", category: "Cultural Experiences", lat: 9.661, lng: 80.025, description: "Historic northern city with distinct culture and temples.", estimatedCost: 0 },
  { placeId: "kandy_roots", name: "Kandy City & Cultural Show", district: "Kandy", category: "Cultural Experiences", lat: 7.290, lng: 80.635, description: "City highlights and Kandyan dance shows.", estimatedCost: 1000 },

  { placeId: "gampola", name: "Ramboda Falls & Waterfalls", district: "Nuwara Eliya", category: "Hill Country", lat: 7.016, lng: 80.611, description: "Scenic waterfalls and viewpoints.", estimatedCost: 0 },
  { placeId: "mulkirigala", name: "Mulkirigala Raja Maha Viharaya", district: "Hambantota", category: "Religious Sites", lat: 6.307, lng: 81.112, description: "Ancient rock temple with murals.", estimatedCost: 300 },

  { placeId: "polhena", name: "Polhena (Matara) Coral Bay", district: "Matara", category: "Beaches", lat: 5.945, lng: 80.511, description: "Protected bay with clear water and snorkeling.", estimatedCost: 0 },
  { placeId: "gala", name: "Galle Lighthouse & Ramparts", district: "Galle", category: "Historical Sites", lat: 6.028, lng: 80.218, description: "Iconic lighthouse and colonial ramparts.", estimatedCost: 0 },

  { placeId: "kithulgala", name: "Kitulgala (White Water Rafting)", district: "Kegalle", category: "Adventure Sports", lat: 6.998, lng: 80.463, description: "White water rafting and rainforest activities.", estimatedCost: 4000 },
  { placeId: "kalpitiya", name: "Kalpitiya (Dolphin & Kiteboarding)", district: "Puttalam", category: "Adventure Sports", lat: 8.130, lng: 79.718, description: "Dolphin watching and water sports.", estimatedCost: 0 },

  { placeId: "kumana", name: "Kumana Bird Sanctuary", district: "Ampara", category: "Wildlife", lat: 7.609, lng: 81.792, description: "Important wetland for birdwatching.", estimatedCost: 0 }
];

async function seedPlaces() {
  console.log('🌱 Starting to seed Places collection in MongoDB...\n');

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(dbName);
    const placesCollection = db.collection('places');

    // Check if places already exist
    const existingCount = await placesCollection.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing places in the collection.`);
      console.log('🗑️  Clearing existing places...');
      await placesCollection.deleteMany({});
      console.log('✅ Cleared existing places\n');
    }

    // Create indexes for better query performance
    await placesCollection.createIndex({ placeId: 1 }, { unique: true });
    await placesCollection.createIndex({ district: 1 });
    await placesCollection.createIndex({ category: 1 });
    console.log('✅ Created indexes for places collection\n');

    let successCount = 0;
    let errorCount = 0;

    // Insert places
    const now = new Date().toISOString();
    const placesWithTimestamps = places.map(place => ({
      ...place,
      createdAt: now,
      updatedAt: now,
    }));

    for (const place of placesWithTimestamps) {
      try {
        await placesCollection.insertOne(place);
        console.log(`✅ Added: ${place.name} (${place.district})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add ${place.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Successfully added: ${successCount} places`);
    console.log(`   ❌ Failed: ${errorCount} places`);
    console.log(`   📍 Total in dataset: ${places.length} places\n`);

    // Display summary by category
    const categoryCounts = {};
    places.forEach(place => {
      categoryCounts[place.category] = (categoryCounts[place.category] || 0) + 1;
    });

    console.log('📂 Places by Category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    // Display summary by district
    console.log('\n🗺️  Places by District:');
    const districtCounts = {};
    places.forEach(place => {
      districtCounts[place.district] = (districtCounts[place.district] || 0) + 1;
    });
    Object.entries(districtCounts).forEach(([district, count]) => {
      console.log(`   ${district}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding places:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ MongoDB connection closed');
    }
  }
}

seedPlaces();
