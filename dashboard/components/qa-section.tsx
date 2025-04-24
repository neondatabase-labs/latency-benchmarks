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
                This benchmark measures the latency between serverless functions and databases across different regions.
                It specifically focuses on the roundtrip time for executing a simple query to retrieve todos from the database.
              </p>
              <p className="mt-2">The measurements include:</p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Network latency between function and database regions</li>
                <li>Database connection establishment time</li>
                <li>Query execution and result retrieval time</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-1">
            <AccordionTrigger>What is a cold query?</AccordionTrigger>
            <AccordionContent>
              <p>
                A cold query is the first query executed against a database in a benchmark run. In Neon, this may trigger a database startup
                if the database has been scaled to zero due to inactivity. This auto-scaling behavior can be configured in the Neon dashboard
                and can also be disabled.
              </p>
              <p className="mt-2">The cold query latency includes:</p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Database startup time (if the database was scaled to zero)</li>
                <li>Query execution and result retrieval</li>
              </ul>
              <p className="mt-2">
                Note: If auto-scaling is disabled, the cold query latency will be similar to hot query latency since the database
                remains running continuously.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>What is a hot query?</AccordionTrigger>
            <AccordionContent>
              <p>
                A hot query is executed immediately after a cold query in the same benchmark run. It represents the best-case
                scenario where the database is already running and ready to handle requests.
              </p>
              <p className="mt-2">The hot query latency primarily reflects:</p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Network roundtrip time</li>
                <li>Query execution time</li>
                <li>Result retrieval time</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>How often are benchmark requests made?</AccordionTrigger>
            <AccordionContent>
              <p>
                Benchmark requests are made every 15 minutes from each serverless function to each database. This is configured
                in the Vercel cron job settings. For each benchmark run:
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>One cold query is executed first</li>
                <li>One hot query is executed immediately after</li>
                <li>Both measurements are stored in the database</li>
              </ul>
              <p className="mt-2">
                This results in 96 measurements per day (4 measurements per hour × 24 hours) for each function-database pair,
                with each measurement including both a cold and hot query result.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What query is being executed for the benchmark?</AccordionTrigger>
            <AccordionContent>
              <p>
                The benchmark executes a simple SELECT query that retrieves todos from the database:
              </p>
              <pre className="bg-muted p-2 rounded-md mt-2 overflow-x-auto">
                {`SELECT id, title, completed, created_at
FROM todos
ORDER BY id ASC
LIMIT 100`}
              </pre>
              <p className="mt-2">
                This query is intentionally simple to focus on measuring connection and network latency rather than
                database processing capabilities.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>How is the data stored and processed?</AccordionTrigger>
            <AccordionContent>
              <p>
                The benchmark system uses two types of databases:
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Benchmark databases: Used to measure latency in different regions</li>
                <li>Metadata database: Stores the measurement results and configuration</li>
              </ul>
              <p className="mt-2">
                Each measurement includes:
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Timestamp of the measurement</li>
                <li>Function and database identifiers</li>
                <li>Latency in milliseconds</li>
                <li>Query type (cold or hot)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>What is the @neondatabase/serverless driver?</AccordionTrigger>
            <AccordionContent>
              <p>
                The benchmark uses the @neondatabase/serverless driver, which is specifically designed for serverless environments.
                This driver has several key characteristics:
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Uses HTTP instead of TCP for communication</li>
                <li>Stateless by design, making it ideal for serverless functions</li>
                <li>Does not require persistent database connections</li>
                <li>Automatically handles connection pooling and management</li>
              </ul>
              <p className="mt-2">
                While this approach prevents the use of database transactions (which require stateful TCP connections),
                it's perfect for simple queries in serverless environments as it eliminates the need to manage database
                connections manually.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
