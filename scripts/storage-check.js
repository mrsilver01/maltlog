const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStoragePaths() {
  console.log('=== STORAGE/IMAGE PATHS CHECK ===\n');

  try {
    // Get the same whiskies as displayed on home page
    const { data: whiskies, error } = await supabase
      .from('whiskies')
      .select('id, name, image')
      .neq('image', '')
      .not('image', 'is', null)
      .order('image', { ascending: false })
      .order('name', { ascending: true })
      .limit(12);

    if (error) {
      console.log('Error fetching whiskies:', error);
      return;
    }

    console.log('Checking image paths for home page whiskies:');
    const results = {
      total: whiskies.length,
      accessible: 0,
      notFound: 0,
      errors: 0,
      details: []
    };

    for (const whisky of whiskies) {
      if (whisky.image) {
        try {
          // Handle both full URLs and relative paths
          let imageUrl;
          if (whisky.image.startsWith('http')) {
            imageUrl = whisky.image;
          } else if (whisky.image.startsWith('/')) {
            // For paths starting with /, construct full URL
            imageUrl = `${supabaseUrl.replace('.supabase.co', '.supabase.co')}${whisky.image}`;
          } else {
            // For relative paths, assume they're in storage
            imageUrl = `${supabaseUrl}/storage/v1/object/public/whisky-images/${whisky.image}`;
          }

          const response = await fetch(imageUrl, { method: 'HEAD' });
          const status = response.status;
          const accessible = response.ok;

          if (accessible) results.accessible++;
          else if (status === 404) results.notFound++;
          else results.errors++;

          console.log(`${accessible ? '✓' : '✗'} ${whisky.id}: ${whisky.image} (${status})`);

          results.details.push({
            id: whisky.id,
            name: whisky.name,
            imagePath: whisky.image,
            url: imageUrl,
            status,
            accessible
          });

        } catch (error) {
          results.errors++;
          console.log(`✗ ${whisky.id}: ${whisky.image} (fetch error: ${error.message})`);

          results.details.push({
            id: whisky.id,
            name: whisky.name,
            imagePath: whisky.image,
            url: 'N/A',
            status: 'error',
            accessible: false,
            error: error.message
          });
        }
      }
    }

    console.log('\n=== STORAGE SUMMARY ===');
    console.log(`Total images: ${results.total}`);
    console.log(`Accessible: ${results.accessible}`);
    console.log(`Not found (404): ${results.notFound}`);
    console.log(`Other errors: ${results.errors}`);

    if (results.notFound > 0 || results.errors > 0) {
      console.log('\n=== MISSING/BROKEN IMAGES ===');
      results.details
        .filter(item => !item.accessible)
        .forEach(item => {
          console.log(`- ${item.id}: ${item.imagePath} (${item.status})`);
        });
    }

    return results;

  } catch (error) {
    console.error('Storage check failed:', error);
  }
}

checkStoragePaths();