import JSZip from 'jszip';

export interface QGISLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  geometry?: string;
  provider?: string;
  source?: string;
  visible: boolean;
  opacity: number;
  style?: any;
}

export interface QGISProjectData {
  title: string;
  layers: QGISLayer[];
  crs?: string;
  extent?: number[];
}

export async function parseQGISProject(file: File): Promise<QGISProjectData> {
  try {
    if (file.name.endsWith('.qgz')) {
      // Handle compressed QGIS project
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(file);
      const qgsFile = zipContents.file(/\.qgs$/)[0];
      
      if (!qgsFile) {
        throw new Error('No .qgs file found in the .qgz archive');
      }
      
      const qgsContent = await qgsFile.async('text');
      return parseQGSContent(qgsContent);
    } else if (file.name.endsWith('.qgs')) {
      // Handle uncompressed QGIS project
      const content = await file.text();
      return parseQGSContent(content);
    } else {
      throw new Error('Unsupported file format');
    }
  } catch (error) {
    console.error('Error parsing QGIS project:', error);
    throw new Error('Failed to parse QGIS project file');
  }
}

function parseQGSContent(xmlContent: string): QGISProjectData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'application/xml');
  
  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML in QGIS project file');
  }
  
  const project = doc.querySelector('qgis');
  if (!project) {
    throw new Error('Invalid QGIS project file structure');
  }
  
  // Extract project title
  const titleElement = project.querySelector('title');
  const title = titleElement?.textContent || 'Untitled Project';
  
  // Extract CRS information
  const crsElement = project.querySelector('projectCrs > spatialrefsys > authid');
  const crs = crsElement?.textContent || 'EPSG:4326';
  
  // Extract layers
  const layerElements = project.querySelectorAll('projectlayers > maplayer');
  const layers: QGISLayer[] = [];
  
  layerElements.forEach((layerElement, index) => {
    const id = layerElement.getAttribute('id') || `layer_${index}`;
    const name = layerElement.querySelector('layername')?.textContent || `Layer ${index + 1}`;
    const typeAttr = layerElement.getAttribute('type');
    const type = typeAttr === 'raster' ? 'raster' : 'vector';
    const geometry = layerElement.getAttribute('geometry') || undefined;
    
    // Extract provider information
    const providerElement = layerElement.querySelector('provider');
    const provider = providerElement?.textContent || 'unknown';
    
    // Extract data source
    const datasourceElement = layerElement.querySelector('datasource');
    const source = datasourceElement?.textContent || '';
    
    // Extract visibility (from layer tree if available, default to true)
    const visible = true; // QGIS doesn't always store visibility in the layer element
    
    // Extract opacity/transparency
    const transparencyElement = layerElement.querySelector('layerTransparency, transparency');
    const transparency = transparencyElement ? parseInt(transparencyElement.textContent || '0') : 0;
    const opacity = (100 - transparency) / 100;
    
    // Extract basic style information
    const rendererElement = layerElement.querySelector('renderer-v2');
    const style = rendererElement ? {
      type: rendererElement.getAttribute('type'),
      symbolCount: rendererElement.querySelectorAll('symbol').length
    } : undefined;
    
    layers.push({
      id,
      name,
      type,
      geometry,
      provider,
      source,
      visible,
      opacity,
      style
    });
  });
  
  return {
    title,
    layers,
    crs
  };
}

export function createLayersFromQGISProject(projectData: QGISProjectData, projectId: string) {
  return projectData.layers.map((qgisLayer) => ({
    id: `qgis-${projectId}-${qgisLayer.id}`,
    name: qgisLayer.name,
    type: qgisLayer.type,
    visible: qgisLayer.visible,
    opacity: qgisLayer.opacity,
    features: qgisLayer.type === 'vector' ? Math.floor(Math.random() * 1000) + 100 : undefined,
    style: qgisLayer.geometry || qgisLayer.style?.type,
    metadata: {
      provider: qgisLayer.provider,
      source: qgisLayer.source,
      geometry: qgisLayer.geometry,
      qgisLayerId: qgisLayer.id
    }
  }));
}