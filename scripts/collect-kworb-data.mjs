import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function scrapeKworbChart() {
  console.log('[v0] Starting kworb chart scraping...');
  
  try {
    const response = await fetch('https://kworb.net/youtube/insights/kr.html');
    const html = await response.text();
    
    console.log('[v0] Fetched HTML, length:', html.length);
    
    // Extract week ending date from HTML
    const weekMatch = html.match(/Week ending (\d{4}-\d{2}-\d{2})/);
    const weekEnding = weekMatch ? weekMatch[1] : new Date().toISOString().split('T')[0];
    
    console.log('[v0] Week ending:', weekEnding);
    
    // Parse table rows
    const rows = [];
    const tableRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    const matches = [...html.matchAll(tableRegex)];
    
    console.log('[v0] Found', matches.length, 'table rows');
    
    for (const match of matches) {
      const row = match[1];
      
      // Extract rank
      const rankMatch = row.match(/<td[^>]*class="mp"[^>]*>(\d+)<\/td>/);
      if (!rankMatch) continue;
      
      const rank = parseInt(rankMatch[1]);
      
      // Extract artist and title
      const titleMatch = row.match(/<td[^>]*class="mp t2"[^>]*><a[^>]*>(.*?)<\/a><\/td>/);
      if (!titleMatch) continue;
      
      const fullTitle = titleMatch[1].trim();
      const [artist, ...titleParts] = fullTitle.split(' - ');
      const title = titleParts.join(' - ');
      
      // Extract video_id
      const videoIdMatch = row.match(/href="\/youtube\/video\/([\w-]+)\.html"/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      
      // Extract streams
      const streamsMatch = row.match(/<td[^>]*class="mp"[^>]*>([\d,]+)<\/td>/);
      const streams = streamsMatch ? parseInt(streamsMatch[1].replace(/,/g, '')) : 0;
      
      // Extract streams delta
      const deltaMatch = row.match(/<td[^>]*class="mp text-[^"]*"[^>]*>([\d,+-]+)<\/td>/);
      const streamsDelta = deltaMatch ? parseInt(deltaMatch[1].replace(/[,+]/g, '')) : null;
      
      // Extract rank change
      const changeMatch = row.match(/<td[^>]*class="mp"[^>]*><span[^>]*>(NEW|RE|[+-]?\d+)<\/span><\/td>/);
      const rankChange = changeMatch ? changeMatch[1] : null;
      
      if (artist && title && videoId) {
        rows.push({
          rank,
          videoId,
          artist: artist.trim(),
          title: title.trim(),
          streams,
          streamsDelta,
          rankChange
        });
      }
    }
    
    console.log('[v0] Parsed', rows.length, 'chart entries');
    console.log('[v0] Top 5 entries:');
    rows.slice(0, 5).forEach(r => {
      console.log(`  ${r.rank}. ${r.artist} - ${r.title} (${r.streams.toLocaleString()} streams)`);
    });
    
    return { weekEnding, entries: rows };
  } catch (error) {
    console.error('[v0] Error scraping kworb:', error);
    throw error;
  }
}

async function saveToDatabase(chartData) {
  console.log('[v0] Saving to database...');
  
  try {
    // Insert or get snapshot
    const snapshotResult = await sql`
      INSERT INTO chart_snapshots (week_ending)
      VALUES (${chartData.weekEnding})
      ON CONFLICT (week_ending) DO UPDATE SET collected_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    
    const snapshotId = snapshotResult[0].id;
    console.log('[v0] Snapshot ID:', snapshotId);
    
    // Delete existing entries for this snapshot
    await sql`DELETE FROM chart_entries WHERE snapshot_id = ${snapshotId}`;
    
    // Insert chart entries
    let inserted = 0;
    for (const entry of chartData.entries) {
      await sql`
        INSERT INTO chart_entries (
          snapshot_id, rank, video_id, artist, title, 
          streams, streams_delta, rank_change
        ) VALUES (
          ${snapshotId}, ${entry.rank}, ${entry.videoId}, 
          ${entry.artist}, ${entry.title}, ${entry.streams},
          ${entry.streamsDelta}, ${entry.rankChange}
        )
      `;
      inserted++;
    }
    
    console.log('[v0] Inserted', inserted, 'chart entries');
    console.log('[v0] Data collection complete!');
    
    return { snapshotId, entriesCount: inserted };
  } catch (error) {
    console.error('[v0] Error saving to database:', error);
    throw error;
  }
}

// Main execution
(async () => {
  try {
    const chartData = await scrapeKworbChart();
    const result = await saveToDatabase(chartData);
    console.log('[v0] Success! Collected', result.entriesCount, 'chart entries for snapshot', result.snapshotId);
  } catch (error) {
    console.error('[v0] Failed to collect chart data:', error);
    process.exit(1);
  }
})();
