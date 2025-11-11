const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableSchemas() {
  console.log('=== TABLE SCHEMA DISCOVERY ===\n');

  try {
    // 1. Check likes table schema
    console.log('1. LIKES TABLE SCHEMA:');
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('*')
      .limit(1);

    if (likesError) {
      console.log('Error:', likesError);
    } else if (likesData.length > 0) {
      console.log('Columns:', Object.keys(likesData[0]));
      console.log('Sample data:', likesData[0]);
    }

    // 2. Check whiskies table schema
    console.log('\n2. WHISKIES TABLE SCHEMA:');
    const { data: whiskiesData, error: whiskiesError } = await supabase
      .from('whiskies')
      .select('*')
      .limit(1);

    if (whiskiesError) {
      console.log('Error:', whiskiesError);
    } else if (whiskiesData.length > 0) {
      console.log('Columns:', Object.keys(whiskiesData[0]));
      console.log('Sample data:', whiskiesData[0]);
    }

    // 3. Check reviews table schema
    console.log('\n3. REVIEWS TABLE SCHEMA:');
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);

    if (reviewsError) {
      console.log('Error:', reviewsError);
    } else if (reviewsData.length > 0) {
      console.log('Columns:', Object.keys(reviewsData[0]));
      console.log('Sample data:', reviewsData[0]);
    }

    // 4. Check post_likes table schema
    console.log('\n4. POST_LIKES TABLE SCHEMA:');
    const { data: postLikesData, error: postLikesError } = await supabase
      .from('post_likes')
      .select('*')
      .limit(1);

    if (postLikesError) {
      console.log('Error:', postLikesError);
    } else if (postLikesData.length > 0) {
      console.log('Columns:', Object.keys(postLikesData[0]));
      console.log('Sample data:', postLikesData[0]);
    }

    // 5. Check review_likes table schema
    console.log('\n5. REVIEW_LIKES TABLE SCHEMA:');
    const { data: reviewLikesData, error: reviewLikesError } = await supabase
      .from('review_likes')
      .select('*')
      .limit(1);

    if (reviewLikesError) {
      console.log('Error:', reviewLikesError);
    } else if (reviewLikesData.length > 0) {
      console.log('Columns:', Object.keys(reviewLikesData[0]));
      console.log('Sample data:', reviewLikesData[0]);
    }

  } catch (error) {
    console.error('Schema check failed:', error);
  }
}

checkTableSchemas();