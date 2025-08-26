-- Fix the malformed YouTube embed URL for Day 10
UPDATE youtube_sessions 
SET youtube_embed_url = 'https://www.youtube.com/embed/7yNQfHcL2Tk?si=h9CIZoZIzdoK8Z2l'
WHERE title = 'Day 10, Python Basics: Core Building Blocks in Geospatial Programming';