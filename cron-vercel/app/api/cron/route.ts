import { getAllDatabases, getFunctionByRegionCode, addLatencyMeasurement } from '@/lib/meta-db';
import { measureLatency } from '@/lib/bench-db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 600; // 10 minutes maximum execution time

export async function GET(request: Request) {
  try {
    // Verify the request is coming from Vercel's cron job
    const authHeader = request.headers.get('authorization');
    if (!process.env.CRON_SECRET) {
      throw new Error('CRON_SECRET is not set');
    }
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const fnRegionCode = process.env.FUNCTION_REGION_CODE;
    if (!fnRegionCode) {
      throw new Error('FUNCTION_REGION_CODE is not set');
    }

    // Get the current Vercel region
    const currentVercelRegion = process.env.VERCEL_REGION;
    if (!currentVercelRegion) {
      throw new Error('Not running in Vercel environment (VERCEL_REGION not set)');
    }

    const currentFn = await getFunctionByRegionCode(fnRegionCode);
    if(!currentFn) {
      throw new Error(`Function with region code ${fnRegionCode} not found`);
    }

    // Verify we're running in the expected Vercel region
    if (currentFn.vercel_region_code !== currentVercelRegion) {
      throw new Error(`Function executing in unexpected Vercel region. Expected: ${currentFn.vercel_region_code}, Actual: ${currentVercelRegion}`);
    }

    // Get all databases
    const databases = await getAllDatabases();
    // Measure latency for each database
    for (const db of databases) {
      try {
        console.log(`Measuring latencies from ${currentFn.region_label} to ${db.region_label}...`);
        
        // First query - cold
        console.log('Performing cold query...');
        const coldLatency = await measureLatency(db.region_code);
        await addLatencyMeasurement(
          currentFn.id,
          db.id,
          coldLatency,
          'cold'
        );
        
        // Second query - hot (immediately after cold)
        console.log('Performing hot query...');
        const hotLatency = await measureLatency(db.region_code);
        await addLatencyMeasurement(
          currentFn.id,
          db.id,
          hotLatency,
          'hot'
        );
      } catch (error) {
        console.error(`Error measuring latency for database ${db.name} in ${db.region_label}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      function: currentFn.region_label,
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 