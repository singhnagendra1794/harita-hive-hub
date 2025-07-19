import { QuizQuestion, QuizCategory } from '@/types/skill-assessment';

export const quizQuestions: Record<QuizCategory, QuizQuestion[]> = {
  'GIS Basics': [
    {
      id: 'gis-1',
      question: 'What does GIS stand for?',
      options: [
        'Geographic Information System',
        'Global Information Service',
        'Geological Information Science',
        'Geographic Intelligence Software'
      ],
      correctAnswer: 'Geographic Information System',
      type: 'multiple-choice'
    },
    {
      id: 'gis-2',
      question: 'Which coordinate system is commonly used for web mapping applications?',
      options: [
        'WGS84 (EPSG:4326)',
        'Web Mercator (EPSG:3857)',
        'UTM Zone 10N',
        'State Plane Coordinate System'
      ],
      correctAnswer: 'Web Mercator (EPSG:3857)',
      type: 'multiple-choice'
    },
    {
      id: 'gis-3',
      question: 'What is the difference between vector and raster data?',
      options: [
        'Vector uses points, lines, polygons; Raster uses pixels in a grid',
        'Vector is for 3D data; Raster is for 2D data',
        'Vector is faster; Raster is more accurate',
        'Vector is newer technology; Raster is legacy'
      ],
      correctAnswer: 'Vector uses points, lines, polygons; Raster uses pixels in a grid',
      type: 'multiple-choice'
    },
    {
      id: 'gis-4',
      question: 'What is topology in GIS?',
      options: [
        'The study of map projections',
        'Spatial relationships between geographic features',
        'The process of georeferencing',
        'A type of coordinate system'
      ],
      correctAnswer: 'Spatial relationships between geographic features',
      type: 'multiple-choice'
    },
    {
      id: 'gis-5',
      question: 'Which file format is commonly used for storing vector data?',
      options: [
        'TIFF',
        'JPEG',
        'Shapefile (.shp)',
        'CSV'
      ],
      correctAnswer: 'Shapefile (.shp)',
      type: 'multiple-choice'
    }
  ],

  'Remote Sensing': [
    {
      id: 'rs-1',
      question: 'What is the primary advantage of multispectral imagery?',
      options: [
        'Higher spatial resolution',
        'Captures information across multiple electromagnetic spectrum bands',
        'Faster processing times',
        'Lower cost'
      ],
      correctAnswer: 'Captures information across multiple electromagnetic spectrum bands',
      type: 'multiple-choice'
    },
    {
      id: 'rs-2',
      question: 'Which Landsat band combination is commonly used for false color composite?',
      options: [
        'RGB (3,2,1)',
        'NIR, Red, Green (4,3,2)',
        'SWIR, NIR, Red (5,4,3)',
        'Blue, Green, Red (1,2,3)'
      ],
      correctAnswer: 'NIR, Red, Green (4,3,2)',
      type: 'multiple-choice'
    },
    {
      id: 'rs-3',
      question: 'What does NDVI measure?',
      options: [
        'Water content in vegetation',
        'Vegetation health and density',
        'Soil moisture levels',
        'Cloud cover percentage'
      ],
      correctAnswer: 'Vegetation health and density',
      type: 'multiple-choice'
    },
    {
      id: 'rs-4',
      question: 'Which satellite constellation provides free, open-access imagery?',
      options: [
        'Landsat',
        'Sentinel',
        'MODIS',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      type: 'multiple-choice'
    },
    {
      id: 'rs-5',
      question: 'What is atmospheric correction in remote sensing?',
      options: [
        'Removing clouds from images',
        'Correcting for atmospheric effects on spectral values',
        'Adjusting image brightness',
        'Georeferencing satellite images'
      ],
      correctAnswer: 'Correcting for atmospheric effects on spectral values',
      type: 'multiple-choice'
    }
  ],

  'Python': [
    {
      id: 'py-1',
      question: 'Which Python library is most commonly used for geospatial data manipulation?',
      options: [
        'Pandas',
        'GeoPandas',
        'NumPy',
        'Matplotlib'
      ],
      correctAnswer: 'GeoPandas',
      type: 'multiple-choice'
    },
    {
      id: 'py-2',
      question: 'What does the following code do: gdf.to_crs(epsg=4326)?',
      options: [
        'Loads data from EPSG 4326',
        'Converts coordinate reference system to WGS84',
        'Creates a new coordinate system',
        'Validates the coordinate system'
      ],
      correctAnswer: 'Converts coordinate reference system to WGS84',
      type: 'multiple-choice'
    },
    {
      id: 'py-3',
      question: 'Which library would you use for raster data processing in Python?',
      options: [
        'Rasterio',
        'Shapely',
        'Folium',
        'Plotly'
      ],
      correctAnswer: 'Rasterio',
      type: 'multiple-choice'
    },
    {
      id: 'py-4',
      question: 'How do you create a buffer around geometries in GeoPandas?',
      options: [
        'gdf.buffer(distance)',
        'gdf.geometry.buffer(distance)',
        'gdf.create_buffer(distance)',
        'buffer(gdf, distance)'
      ],
      correctAnswer: 'gdf.geometry.buffer(distance)',
      type: 'multiple-choice'
    },
    {
      id: 'py-5',
      question: 'What is the purpose of the Shapely library?',
      options: [
        'Creating interactive maps',
        'Geometric operations and spatial analysis',
        'Reading satellite imagery',
        'Database connections'
      ],
      correctAnswer: 'Geometric operations and spatial analysis',
      type: 'multiple-choice'
    }
  ],

  'SQL': [
    {
      id: 'sql-1',
      question: 'What is PostGIS?',
      options: [
        'A GIS software application',
        'A spatial extension for PostgreSQL database',
        'A web mapping framework',
        'A coordinate reference system'
      ],
      correctAnswer: 'A spatial extension for PostgreSQL database',
      type: 'multiple-choice'
    },
    {
      id: 'sql-2',
      question: 'Which SQL function calculates the distance between two points in PostGIS?',
      options: [
        'ST_Distance()',
        'ST_Length()',
        'ST_Area()',
        'ST_Buffer()'
      ],
      correctAnswer: 'ST_Distance()',
      type: 'multiple-choice'
    },
    {
      id: 'sql-3',
      question: 'What does ST_Intersects() return?',
      options: [
        'The intersection geometry',
        'Boolean (true/false) if geometries intersect',
        'The area of intersection',
        'The distance between geometries'
      ],
      correctAnswer: 'Boolean (true/false) if geometries intersect',
      type: 'multiple-choice'
    },
    {
      id: 'sql-4',
      question: 'How do you create a spatial index in PostGIS?',
      options: [
        'CREATE INDEX ON table USING GIST(geom_column)',
        'CREATE SPATIAL INDEX ON table(geom_column)',
        'ADD SPATIAL INDEX TO table(geom_column)',
        'CREATE GIST INDEX table.geom_column'
      ],
      correctAnswer: 'CREATE INDEX ON table USING GIST(geom_column)',
      type: 'multiple-choice'
    },
    {
      id: 'sql-5',
      question: 'Which function converts text to geometry in PostGIS?',
      options: [
        'ST_AsText()',
        'ST_GeomFromText()',
        'ST_MakeGeom()',
        'ST_TextToGeom()'
      ],
      correctAnswer: 'ST_GeomFromText()',
      type: 'multiple-choice'
    }
  ],

  'QGIS': [
    {
      id: 'qgis-1',
      question: 'What is the QGIS Processing Toolbox used for?',
      options: [
        'Layer management',
        'Geoprocessing and analysis algorithms',
        'Map layout design',
        'Plugin installation'
      ],
      correctAnswer: 'Geoprocessing and analysis algorithms',
      type: 'multiple-choice'
    },
    {
      id: 'qgis-2',
      question: 'Which QGIS tool would you use to combine multiple vector layers?',
      options: [
        'Merge Vector Layers',
        'Union',
        'Join Attributes by Location',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      type: 'multiple-choice'
    },
    {
      id: 'qgis-3',
      question: 'How do you access the Field Calculator in QGIS?',
      options: [
        'Right-click layer > Open Attribute Table > Field Calculator',
        'Vector menu > Field Calculator',
        'Processing Toolbox > Field Calculator',
        'Layer Properties > Field Calculator'
      ],
      correctAnswer: 'Right-click layer > Open Attribute Table > Field Calculator',
      type: 'multiple-choice'
    },
    {
      id: 'qgis-4',
      question: 'What file format does QGIS use for saving projects?',
      options: [
        '.qgs',
        '.qgz',
        'Both .qgs and .qgz',
        '.qproj'
      ],
      correctAnswer: 'Both .qgs and .qgz',
      type: 'multiple-choice'
    },
    {
      id: 'qgis-5',
      question: 'Which algorithm would you use to find features within a certain distance of other features?',
      options: [
        'Buffer',
        'Select by Location',
        'Join Attributes by Location',
        'Distance Matrix'
      ],
      correctAnswer: 'Join Attributes by Location',
      type: 'multiple-choice'
    }
  ],

  'GeoAI': [
    {
      id: 'geoai-1',
      question: 'What is the primary advantage of using machine learning for image classification in remote sensing?',
      options: [
        'Faster processing',
        'Automated feature extraction and pattern recognition',
        'Lower cost',
        'Better image quality'
      ],
      correctAnswer: 'Automated feature extraction and pattern recognition',
      type: 'multiple-choice'
    },
    {
      id: 'geoai-2',
      question: 'Which deep learning architecture is commonly used for satellite image segmentation?',
      options: [
        'LSTM',
        'CNN (Convolutional Neural Network)',
        'RNN',
        'Decision Trees'
      ],
      correctAnswer: 'CNN (Convolutional Neural Network)',
      type: 'multiple-choice'
    },
    {
      id: 'geoai-3',
      question: 'What is transfer learning in the context of GeoAI?',
      options: [
        'Moving data between systems',
        'Using pre-trained models and adapting them for specific geospatial tasks',
        'Converting between coordinate systems',
        'Transferring images between satellites'
      ],
      correctAnswer: 'Using pre-trained models and adapting them for specific geospatial tasks',
      type: 'multiple-choice'
    },
    {
      id: 'geoai-4',
      question: 'Which Google platform provides access to petabyte-scale geospatial analysis?',
      options: [
        'Google Cloud Platform',
        'Google Earth Engine',
        'Google Maps API',
        'Google Earth Pro'
      ],
      correctAnswer: 'Google Earth Engine',
      type: 'multiple-choice'
    },
    {
      id: 'geoai-5',
      question: 'What is the main challenge when applying AI to geospatial data?',
      options: [
        'Limited computing power',
        'Spatial autocorrelation and geographic context',
        'Data visualization',
        'Internet connectivity'
      ],
      correctAnswer: 'Spatial autocorrelation and geographic context',
      type: 'multiple-choice'
    }
  ]
};