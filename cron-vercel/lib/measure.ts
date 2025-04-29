import { getAllDatabases, getFunctionByRegionCode, addLatencyMeasurement } from '@/lib/meta-db';
import { measureLatency } from '@/lib/bench-db';
import { getAWSRegionCode } from '@/lib/vercel';
import { NextResponse } from 'next/server';

export async function handleRegionBenchmarkRequest(request: Request, expectedVercelRegion: string) {
  try {
    console.log(`Handling region benchmark request for ${expectedVercelRegion}`);
    const authHeader = request.headers.get('authorization');
    if (!process.env.CRON_SECRET) {
      throw new Error('CRON_SECRET is not set');
    }
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const envVercelRegion = process.env.VERCEL_REGION;
    if (!envVercelRegion) {
      throw new Error('Not running in Vercel environment (VERCEL_REGION not set)');
    }
    if(envVercelRegion !== expectedVercelRegion) {
        throw new Error(`Function executing in unexpected Vercel region. Expected: ${expectedVercelRegion}, Actual: ${envVercelRegion}`);
    }

    const result = await measureRegion(envVercelRegion);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Region measurement error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function measureRegion(vercelRegionCode: string) {
  const awsRegionCode = getAWSRegionCode(vercelRegionCode);
  const currentFn = await getFunctionByRegionCode(awsRegionCode);
  if(!currentFn) {
    throw new Error(`Function with region code ${awsRegionCode} not found`);
  }

  // Get all databases for this function
  const databases = await getAllDatabases(currentFn.id);
  // Measure latency for each database
  for (const db of databases) {
    try {
      console.log(`Measuring latencies from ${currentFn.region_label} to ${db.region_label} using ${db.connection_method}...`);
      
      // First query - cold
      console.log('Performing cold query...');
      const coldLatency = await measureLatency(db.connection_url, db.connection_method);
      
      await addLatencyMeasurement(
        currentFn.id,
        db.id,
        coldLatency,
        'cold'
      );
      
      // Second query - hot (immediately after cold)
      console.log('Performing hot query...');
      const hotLatency = await measureLatency(db.connection_url, db.connection_method);
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

  return {
    success: true,
    function: currentFn.region_label,
  };
} 