-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert 100 todos
INSERT INTO todos (title, completed)
SELECT 
    'Todo Item #' || generate_series AS title,
    (random() > 0.5) AS completed
FROM generate_series(1, 100); 