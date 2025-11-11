const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function comprehensiveAnalysis() {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  console.log(`=== DB SNAPSHOT & CONSTRAINT ANALYSIS - ${timestamp} ===\n`);

  const results = {
    timestamp,
    tableCounts: {},
    insertTrends: {},
    duplicates: {},
    rls: {},
    foreignKeys: {},
    indexes: {},
    storageCheck: {},
    performance: {}
  };

  try {
    // 1. TABLE ROW COUNTS
    console.log('1. TABLE ROW COUNTS:');
    const [likesCount, postLikesCount, reviewLikesCount] = await Promise.all([
      supabase.from('likes').select('*', { count: 'exact', head: true }),
      supabase.from('post_likes').select('*', { count: 'exact', head: true }),
      supabase.from('review_likes').select('*', { count: 'exact', head: true })
    ]);

    results.tableCounts = {
      likes: likesCount.count || 0,
      post_likes: postLikesCount.count || 0,
      review_likes: reviewLikesCount.count || 0
    };

    console.log(`likes: ${results.tableCounts.likes}`);
    console.log(`post_likes: ${results.tableCounts.post_likes}`);
    console.log(`review_likes: ${results.tableCounts.review_likes}`);

    // 2. 30-DAY INSERT TRENDS
    console.log('\n2. LIKES INSERT TREND (30 DAYS):');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentLikes, error: trendError } = await supabase
      .from('likes')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at');

    if (!trendError && recentLikes) {
      const dailyCounts = {};
      recentLikes.forEach(row => {
        const date = new Date(row.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      results.insertTrends.likes = dailyCounts;

      Object.entries(dailyCounts)
        .sort()
        .forEach(([date, count]) => {
          console.log(`${date}: ${count}`);
        });
    }

    // 3. DUPLICATE DETECTION
    console.log('\n3. DUPLICATE LIKES CHECK (user_id, whisky_id):');
    const { data: allLikes, error: duplicateError } = await supabase
      .from('likes')
      .select('user_id, whisky_id');

    if (!duplicateError && allLikes) {
      const duplicates = {};
      allLikes.forEach(row => {
        const key = `${row.user_id}_${row.whisky_id}`;
        duplicates[key] = (duplicates[key] || 0) + 1;
      });

      const duplicateEntries = Object.entries(duplicates)
        .filter(([key, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      results.duplicates.likes = duplicateEntries;

      if (duplicateEntries.length > 0) {
        console.log('Found duplicates:');
        duplicateEntries.forEach(([key, count]) => {
          const [user_id, whisky_id] = key.split('_');
          console.log(`user_id: ${user_id}, whisky_id: ${whisky_id}, count: ${count}`);
        });
      } else {
        console.log('No duplicates found.');
      }
    }

    // 4. FOREIGN KEY ANALYSIS
    console.log('\n4. FOREIGN KEY ANALYSIS:');

    // Check whiskies.id uniqueness
    const { data: whiskiesData, error: whiskiesError } = await supabase
      .from('whiskies')
      .select('id');

    if (!whiskiesError && whiskiesData) {
      const ids = whiskiesData.map(row => row.id);
      const uniqueIds = new Set(ids);

      results.foreignKeys.whiskies = {
        total: ids.length,
        unique: uniqueIds.size,
        duplicates: ids.length - uniqueIds.size,
        canUseFk: ids.length === uniqueIds.size
      };

      console.log(`Total whiskies: ${ids.length}`);
      console.log(`Unique IDs: ${uniqueIds.size}`);
      console.log(`Duplicates: ${ids.length - uniqueIds.size}`);

      if (ids.length === uniqueIds.size) {
        console.log('✓ whiskies.id can be used for FK constraint');
      } else {
        console.log('✗ whiskies.id has duplicates, FK not safe');
      }
    }

    // 5. CHECK AGGREGATION COLUMNS
    console.log('\n5. AGGREGATION COLUMNS CHECK:');

    // Check if aggregation columns exist and are accurate
    const { data: whiskiesWithStats, error: statsError } = await supabase
      .from('whiskies')
      .select('id, likes, avg_rating')
      .limit(5);

    if (!statsError && whiskiesWithStats) {
      console.log('✓ whiskies table has likes and avg_rating columns');
      console.log('Sample aggregation data:');
      whiskiesWithStats.forEach(whisky => {
        console.log(`  ${whisky.id}: likes=${whisky.likes}, avg_rating=${whisky.avg_rating}`);
      });

      // Check if aggregation is accurate
      const { data: likeCounts, error: likeCountError } = await supabase
        .from('likes')
        .select('whisky_id');

      if (!likeCountError) {
        const actualLikeCounts = {};
        likeCounts.forEach(like => {
          actualLikeCounts[like.whisky_id] = (actualLikeCounts[like.whisky_id] || 0) + 1;
        });

        console.log('\nActual vs Stored Like Counts:');
        whiskiesWithStats.forEach(whisky => {
          const actual = actualLikeCounts[whisky.id] || 0;
          const stored = whisky.likes || 0;
          const match = actual === stored ? '✓' : '✗';
          console.log(`  ${whisky.id}: actual=${actual}, stored=${stored} ${match}`);
        });
      }
    }

    // 6. RLS POLICIES CHECK (This would require admin access to pg_policies)
    console.log('\n6. RLS POLICIES STATUS:');
    console.log('Note: RLS policy details require database admin access');
    console.log('Manual check required in Supabase Dashboard > Authentication > Policies');

    // 7. STORAGE/IMAGE CHECK
    console.log('\n7. STORAGE/IMAGE PATHS CHECK:');
    const { data: featuredWhiskies, error: storageError } = await supabase
      .from('whiskies')
      .select('id, image')
      .eq('is_featured', true)
      .order('display_order')
      .limit(12);

    if (!storageError && featuredWhiskies) {
      console.log('Checking image paths for featured whiskies:');
      results.storageCheck.featured = featuredWhiskies;

      for (const whisky of featuredWhiskies) {
        if (whisky.image) {
          const imageUrl = whisky.image.startsWith('http') ?
            whisky.image :
            `${supabaseUrl}/storage/v1/object/public/whisky-images${whisky.image}`;

          try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            const status = response.ok ? '✓' : '✗';
            console.log(`  ${whisky.id}: ${whisky.image} ${status} (${response.status})`);
          } catch (error) {
            console.log(`  ${whisky.id}: ${whisky.image} ✗ (fetch error)`);
          }
        }
      }
    }

    return results;

  } catch (error) {
    console.error('Analysis failed:', error);
    return results;
  }
}

// Run the analysis
comprehensiveAnalysis().then(results => {
  // Save results to a file for report generation
  require('fs').writeFileSync(
    `scripts/analysis-results-${results.timestamp}.json`,
    JSON.stringify(results, null, 2)
  );
  console.log(`\nResults saved to analysis-results-${results.timestamp}.json`);
});