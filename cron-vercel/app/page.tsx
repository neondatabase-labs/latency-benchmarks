export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>Neon Latency Benchmarks - Cron Service</h1>
      <p>This is a service application that runs cron jobs to measure database latency.</p>
      <p>It's not meant to be accessed directly.</p>
    </div>
  );
} 