const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDatabaseAnalysis() {
  console.log('=== DB SNAPSHOT & CONSTRAINT ANALYSIS ===\n');

  try {
    // 1. Row counts for likes tables
    console.log('1. LIKES TABLES ROW COUNT:');
    const likesCount = await supabase.rpc('get_likes_counts');
    if (likesCount.error) {
      // Fallback to individual queries
      const [likes, postLikes, reviewLikes] = await Promise.all([
        supabase.from('likes').select('*', { count: 'exact', head: true }),
        supabase.from('post_likes').select('*', { count: 'exact', head: true }),
        supabase.from('review_likes').select('*', { count: 'exact', head: true })
      ]);

      console.log(`likes: ${likes.count || 0}`);
      console.log(`post_likes: ${postLikes.count || 0}`);
      console.log(`review_likes: ${reviewLikes.count || 0}`);
    } else {
      console.log(likesCount.data);
    }

    // 2. Recent 30 days insert trends for likes
    console.log('\n2. LIKES INSERT TREND (30 DAYS):');
    const { data: trendData, error: trendError } = await supabase
      .from('likes')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (trendError) {
      console.log('Error fetching trend data:', trendError);
    } else {
      const dailyCounts = {};
      trendData.forEach(row => {
        const date = new Date(row.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      Object.entries(dailyCounts)
        .sort()
        .forEach(([date, count]) => {
          console.log(`${date}: ${count}`);
        });
    }

    // 3. Check for duplicates in likes table
    console.log('\n3. DUPLICATE LIKES CHECK (uid, whisky_id):');
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('uid, whisky_id');

    if (likesError) {
      console.log('Error fetching likes data:', likesError);
    } else {
      const duplicates = {};
      likesData.forEach(row => {
        const key = `${row.uid}_${row.whisky_id}`;
        duplicates[key] = (duplicates[key] || 0) + 1;
      });

      const duplicateEntries = Object.entries(duplicates)
        .filter(([key, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      if (duplicateEntries.length > 0) {
        console.log('Found duplicates:');
        duplicateEntries.forEach(([key, count]) => {
          const [uid, whisky_id] = key.split('_');
          console.log(`uid: ${uid}, whisky_id: ${whisky_id}, count: ${count}`);
        });
      } else {
        console.log('No duplicates found.');
      }
    }

    // 4. Check table schemas
    console.log('\n4. TABLE SCHEMAS:');

    // Check whiskies table for required columns
    const { data: whiskiesSchema, error: whiskiesSchemaError } = await supabase
      .from('whiskies')
      .select('slug, likes, avg_rating, total_reviews')
      .limit(1);

    if (whiskiesSchemaError) {
      console.log('Whiskies table schema issue:', whiskiesSchemaError.message);
    } else {
      console.log('Whiskies table has required columns for aggregation');
    }

    // 5. Check for foreign key constraints
    console.log('\n5. FOREIGN KEY ANALYSIS:');

    // Check if whiskies.slug is unique
    const { data: slugCheck, error: slugError } = await supabase
      .from('whiskies')
      .select('slug');

    if (slugError) {
      console.log('Error checking slug uniqueness:', slugError);
    } else {
      const slugs = slugCheck.map(row => row.slug);
      const uniqueSlugs = new Set(slugs);
      console.log(`Total whiskies: ${slugs.length}`);
      console.log(`Unique slugs: ${uniqueSlugs.size}`);
      console.log(`Duplicates: ${slugs.length - uniqueSlugs.size}`);

      if (slugs.length === uniqueSlugs.size) {
        console.log('✓ whiskies.slug can be used for FK constraint');
      } else {
        console.log('✗ whiskies.slug has duplicates, FK not safe');
      }
    }

  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

runDatabaseAnalysis();