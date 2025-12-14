
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_threads_title_fts
ON thread
USING GIN (to_tsvector('english', thread_title));

CREATE INDEX IF NOT EXISTS idx_threads_title_trgm
ON thread
USING GIST (thread_title gist_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_posts_content_fts
ON post
USING GIN (to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_posts_content_trgm
ON post
USING GIST (content gist_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_topics_name_fts
ON topic
USING GIN (to_tsvector('english', topic_name));

CREATE INDEX IF NOT EXISTS idx_topics_name_trgm
ON topic
USING GIST (topic_name gist_trgm_ops);
