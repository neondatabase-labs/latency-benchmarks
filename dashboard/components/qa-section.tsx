import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function QASection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-0">
            <AccordionTrigger>What does this benchmark measure?</AccordionTrigger>
            <AccordionContent>
              <p>
                This benchmark specifically measures <strong>network latency and roundtrip times</strong> between
                serverless functions and databases in different regions. It is <strong>not</strong> a test of database
                performance, query optimization, or database engine capabilities.
              </p>
              <p className="mt-2">The primary factors affecting these measurements are:</p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Geographic distance between the serverless function and database</li>
                <li>Network conditions and routing</li>
                <li>Cold start times for serverless databases</li>
                <li>Connection establishment overhead</li>
              </ul>
              <p className="mt-2">
                For comprehensive database performance testing, you would need more complex queries that test CPU,
                memory, I/O operations, and query optimization capabilities.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-1">
            <AccordionTrigger>What is a cold query?</AccordionTrigger>
            <AccordionContent>
              <p>
                A cold query is a database query that triggers a cold start in the database. This happens when the
                database has been idle and needs to allocate resources to handle the request. For serverless databases,
                this typically involves starting up compute resources that have been scaled to zero.
              </p>
              <p className="mt-2">The latency measured here primarily reflects the time it takes to:</p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Allocate and initialize database compute resources</li>
                <li>Establish a new connection</li>
                <li>Execute a simple query</li>
                <li>Return the results</li>
              </ul>
              <p className="mt-2">
                For Neon Postgres specifically, a cold query may involve starting up a compute instance that has been
                scaled to zero, which can add several hundred milliseconds to the query time.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>What is a hot query?</AccordionTrigger>
            <AccordionContent>
              <p>
                A hot query is a database query that executes when the database is already running and has resources
                allocated. These queries typically have lower latency because:
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Database connections are already established</li>
                <li>Compute resources are already running</li>
                <li>Connection pools may be utilized</li>
              </ul>
              <p className="mt-2">
                The latency measured for hot queries primarily reflects network roundtrip time and minimal query
                processing overhead, making it a good indicator of the baseline network latency between the serverless
                function and database.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>How often are benchmark requests made?</AccordionTrigger>
            <AccordionContent>
              <p>
                Benchmark requests are made every 15 minutes from each serverless function to each database. This
                results in approximately 96 measurements per day for each function-database pair. Both cold and hot
                queries are executed in sequence during each benchmark run.
              </p>
              <p className="mt-2">
                For cold query testing, we ensure the database has been idle for at least 10 minutes before executing
                the query to accurately measure cold start performance.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>How is the daily average calculated?</AccordionTrigger>
            <AccordionContent>
              <p>
                The daily average is calculated by taking the mean of all latency measurements for a specific
                function-database-query type combination within a 24-hour period (UTC). Outliers beyond 3 standard
                deviations from the mean are excluded from the calculation to prevent extreme values from skewing the
                results.
              </p>
              <p className="mt-2">
                For cold queries, we typically have 24 measurements per day (one per hour). For hot queries, we have
                approximately 72 measurements per day (three per hour).
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>What query is being executed for the benchmark?</AccordionTrigger>
            <AccordionContent>
              <p>
                The benchmark executes a very simple SELECT query that retrieves a small amount of data. The query is
                intentionally lightweight to ensure we're measuring network latency and connection overhead rather than
                database processing capabilities:
              </p>
              <pre className="bg-muted p-2 rounded-md mt-2 overflow-x-auto">
                {`SELECT id, name, created_at 
FROM users 
WHERE id < 100 
LIMIT 10;`}
              </pre>
              <p className="mt-2">This simple query ensures that:</p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Database processing time is minimal</li>
                <li>The amount of data transferred is small and consistent</li>
                <li>The query can run on any standard database without special optimizations</li>
                <li>Results primarily reflect network latency and connection overhead</li>
              </ul>
              <p className="mt-2">
                For cold queries, we ensure the database has been idle for at least 10 minutes before executing the
                query to accurately measure cold start times.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
