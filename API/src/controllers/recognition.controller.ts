import { Request, Response } from 'express';
import * as vision from '@google-cloud/vision';
import sharp from 'sharp';
import { sendError, sendSuccess } from '../utils/response.util';

interface LandmarkInfo {
  name: string;
  description: string;
  confidence: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class RecognitionController {
  private visionClient: vision.ImageAnnotatorClient;
  
  // Sri Lankan landmarks database for enhanced descriptions
  private sriLankanLandmarks: { [key: string]: string } = {
    'sigiriya': 'Sigiriya (Lion Rock) is an ancient rock fortress located in the central Matale District of Sri Lanka. Built by King Kashyapa in the 5th century AD, this UNESCO World Heritage Site features remarkable frescoes, landscaped gardens, and a palace complex at the summit. The site is famous for its Mirror Wall and the Lion Gate. Best visited early morning to avoid heat, it takes about 2-3 hours to climb the 1,200 steps to the top.',
    'temple of the tooth': 'The Temple of the Sacred Tooth Relic (Sri Dalada Maligawa) in Kandy is one of the most sacred Buddhist sites in the world. It houses the relic of the tooth of Buddha and has been a place of worship and pilgrimage since the 4th century CE. The temple complex features beautiful Kandyan architecture, daily pujas (prayer ceremonies), and is part of the UNESCO World Heritage Site. The annual Esala Perahera festival is held here.',
    'galle fort': 'Galle Fort is a UNESCO World Heritage Site located in the bay of Galle on the southwestern coast of Sri Lanka. Originally built by the Portuguese in 1588, it was extensively fortified by the Dutch during the 17th century. The fort features well-preserved colonial architecture, cobblestone streets, lighthouses, churches, and museums. It\'s a living heritage site with hotels, shops, and residences within the fort walls.',
    'adams peak': 'Adams Peak (Sri Pada) is a 2,243m tall conical mountain in central Sri Lanka, sacred to Buddhists, Hindus, Muslims, and Christians. The peak features a "Sacred Footprint" at its summit. The pilgrimage season runs from December to May, with most pilgrims climbing at night to reach the summit at dawn. The climb takes 4-6 hours via well-maintained steps with rest stops and refreshment stalls along the way.',
    'dambulla cave temple': 'The Dambulla Cave Temple, also known as the Golden Temple of Dambulla, is a UNESCO World Heritage Site dating back to the 1st century BCE. The complex contains five caves with over 150 Buddha statues and extensive murals covering 2,100 square meters of painted wall and ceiling. Located in central Sri Lanka, it\'s the largest and best-preserved cave temple complex in the country.',
    'yala national park': 'Yala National Park is Sri Lanka\'s most visited and second-largest national park, famous for having one of the highest leopard densities in the world. Located in the southeastern region, the park features diverse ecosystems including forests, grasslands, and lagoons. Wildlife includes elephants, sloth bears, crocodiles, and numerous bird species. Best visited during dry season (February to July) for wildlife viewing.',
    'polonnaruwa': 'Polonnaruwa is an ancient city and UNESCO World Heritage Site that served as Sri Lanka\'s medieval capital from the 11th to 13th centuries. The archaeological park features well-preserved ruins including the Royal Palace, Gal Vihara (rock temple with massive Buddha statues), Parakrama Samudra reservoir, and numerous Buddhist temples. It showcases the architectural brilliance of ancient Sinhalese civilization.',
    'anuradhapura': 'Anuradhapura is one of the ancient capitals of Sri Lanka and a UNESCO World Heritage Site, famous for its well-preserved ruins of ancient Sinhalese civilization. Key attractions include the sacred Bodhi Tree (oldest historically authenticated tree in the world), massive dagobas (stupas), ancient pools, and monasteries. The city was the center of Theravada Buddhism for many centuries.',
    'ella': 'Ella is a charming small town in the Badulla District, surrounded by the beautiful greenery of tea plantations and mountains. Famous attractions include Ella Rock, Little Adam\'s Peak, Nine Arch Bridge, and Ravana Falls. The area offers excellent hiking, breathtaking views, and a cool climate. The train journey to Ella from Kandy or Nuwara Eliya is considered one of the most scenic train rides in the world.',
    'mirissa': 'Mirissa is a small coastal town on the south coast of Sri Lanka, famous for its stunning beaches, whale watching opportunities, and vibrant nightlife. The best time for whale watching is November to April when blue whales and dolphins are commonly spotted. The town features beautiful sandy beaches, excellent surfing conditions, and fresh seafood restaurants.',
    'nuwara eliya': 'Nuwara Eliya, known as "Little England," is a hill station in the central highlands famous for its cool climate, colonial architecture, and tea plantations. Located at 1,868m above sea level, it features Victorian-style buildings, beautiful gardens, and is surrounded by tea estates. Key attractions include Gregory Lake, Horton Plains National Park, and tea factory tours. Best visited April-August.',
    'horton plains': 'Horton Plains National Park is a UNESCO World Heritage Site located in the central highlands at an altitude of 2,100-2,300m. Famous for World\'s End (a sheer cliff with a 1,200m drop), Baker\'s Falls, and unique cloud forest ecosystem. The park is home to endemic species including the Sri Lankan sambar deer. The 9km circular trail to World\'s End is best hiked early morning before clouds obscure the view.',
    'udawalawe': 'Udawalawe National Park is famous for its large elephant population and is one of the best places in Sri Lanka for elephant watching. The park features open grasslands and scrub forests centered around the Udawalawe Reservoir. Besides elephants, visitors can spot water buffalo, deer, crocodiles, and numerous bird species. The nearby Elephant Transit Home rehabilitates orphaned elephant calves.'
  };

  constructor() {
    // Initialize Vision API client with credentials from environment
    const credentialsPath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
    
    if (!credentialsPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set in environment variables');
    }

    this.visionClient = new vision.ImageAnnotatorClient({
      keyFilename: credentialsPath
    });
  }

  recognizeImage = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        sendError(res, 'No image file provided', 400);
        return;
      }

      console.log('Processing image recognition request...');

      // Process image with sharp to optimize size
      const processedImage = await sharp(req.file.buffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      // Perform landmark detection using Google Cloud Vision API
      const [landmarkResult] = await this.visionClient.landmarkDetection({
        image: { content: processedImage }
      });

      const landmarks = landmarkResult.landmarkAnnotations;

      console.log('Vision API response:', JSON.stringify(landmarks, null, 2));

      // Check if any landmarks were detected
      if (landmarks && landmarks.length > 0) {
        const primaryLandmark = landmarks[0];
        
        if (primaryLandmark) {
          const landmarkName = primaryLandmark.description || 'Unknown Location';
          const confidence = primaryLandmark.score || 0;

          console.log(`Detected landmark: ${landmarkName} with confidence: ${confidence}`);
          
          // Check if the detected landmark is in our Sri Lankan database
          const isKnownSriLankanLandmark = this.isKnownSriLankanLandmark(landmarkName);

          if (isKnownSriLankanLandmark) {
            // Get coordinates if available
            let coordinates;
            if (primaryLandmark.locations && primaryLandmark.locations.length > 0) {
              const firstLocation = primaryLandmark.locations[0];
              if (firstLocation) {
                const location = firstLocation.latLng;
                if (location) {
                  coordinates = {
                    latitude: location.latitude || 0,
                    longitude: location.longitude || 0
                  };
                }
              }
            }

            // Get enhanced description for Sri Lankan landmarks
            let enhancedDescription = this.getEnhancedDescription(landmarkName);

            // Add a prefix based on the confidence score
            const confidencePrefix = this.getConfidencePrefix(confidence);
            enhancedDescription = `${confidencePrefix} ${landmarkName}. ${enhancedDescription}`;

            const locationData: LandmarkInfo = {
              name: landmarkName,
              description: enhancedDescription.trim(),
              confidence: Math.round(confidence * 100),
              ...(coordinates && { coordinates })
            };

            sendSuccess(res, locationData, 'Landmark recognized successfully');
          } else {
            // The landmark is recognized but is not a known Sri Lankan landmark
            const confidencePrefix = this.getConfidencePrefix(confidence);
            const description = `${confidencePrefix} ${landmarkName}. However, this is not a recognized Sri Lankan tourist destination in our database. This app focuses on providing information about landmarks within Sri Lanka.`;
            sendSuccess(res, {
              name: landmarkName,
              description: description,
              confidence: Math.round(confidence * 100)
            }, 'Landmark recognized, but it is not a supported Sri Lankan destination.');
          }
          return;
        }
      }

      // If no landmarks detected, try label detection for general scene understanding
      console.log('No landmarks detected, trying label detection...');
      const [labelResult] = await this.visionClient.labelDetection({
        image: { content: processedImage }
      });

      const labels = labelResult.labelAnnotations;

      if (labels && labels.length > 0) {
        // Check if labels suggest it might be a Sri Lankan location
        const sriLankaRelated = this.checkSriLankaRelevance(labels);
        
        if (sriLankaRelated) {
          const topLabels = labels.slice(0, 3).map((label: vision.protos.google.cloud.vision.v1.IEntityAnnotation) => label.description).join(', ');
          
          sendSuccess(res, {
            name: 'Unidentified Sri Lankan Location',
            description: `This appears to be a location in Sri Lanka showing: ${topLabels}. While I couldn't identify the specific landmark, the image seems to show Sri Lankan scenery or architecture. For better results, try uploading a clearer image of a well-known landmark like Sigiriya, Temple of the Tooth, or Galle Fort.`,
            confidence: 0
          }, 'Scene detected but landmark not specifically identified');
          return;
        }
      }

      // No landmark detected and not clearly Sri Lanka-related
      sendSuccess(res, {
        name: 'Unknown Location',
        description: 'I couldn\'t identify this as a known Sri Lankan tourist destination. Please try uploading a clearer image of a well-known Sri Lankan landmark such as Sigiriya, Temple of the Tooth in Kandy, Galle Fort, Adams Peak, or any major temple or national park. Make sure the landmark is clearly visible in the image.',
        confidence: 0
      }, 'No landmark detected');

    } catch (error: any) {
      console.error('Image recognition error:', error);
      
      // Provide more specific error messages
      if (error.code === 3 || error.code === 'INVALID_ARGUMENT') {
        sendError(res, 'Invalid image format. Please upload a valid JPG, PNG, or JPEG image.', 400);
      } else if (error.code === 7 || error.code === 'PERMISSION_DENIED') {
        sendError(res, 'Permission denied. Please check Google Cloud Vision API credentials.', 500);
      } else {
        sendError(res, error.message || 'Failed to recognize image', 500);
      }
    }
  };

  /**
   * Returns a descriptive prefix based on the recognition confidence score.
   */
  private getConfidencePrefix(confidence: number): string {
    if (confidence > 0.75) {
      return 'This is very likely';
    }
    if (confidence > 0.5) {
      return 'This is likely';
    }
    if (confidence > 0.25) {
      return 'This could be';
    }
    return 'This might be';
  }

  /**
   * Checks if a landmark name exists in the local Sri Lankan landmarks database.
   */
  private isKnownSriLankanLandmark(landmarkName: string): boolean {
    const normalizedName = landmarkName.toLowerCase();
    for (const key of Object.keys(this.sriLankanLandmarks)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get enhanced description for Sri Lankan landmarks
   */
  private getEnhancedDescription(landmarkName: string): string {
    const normalizedName = landmarkName.toLowerCase();
    
    // Check for exact or partial matches in our database
    for (const [key, description] of Object.entries(this.sriLankanLandmarks)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return description;
      }
    }

    // If not in database, provide generic description
    return `It is a notable location in Sri Lanka, recognized for its cultural, historical, or natural significance. For the best experience, consider visiting during the dry season (December to March) and hiring a local guide who can provide detailed insights about the location's history and importance.`;
  }

  /**
   * Check if detected labels suggest Sri Lanka-related content
   */
  private checkSriLankaRelevance(labels: vision.protos.google.cloud.vision.v1.IEntityAnnotation[]): boolean {
    const sriLankaKeywords = [
      'temple', 'buddhist', 'stupa', 'dagoba', 'buddha', 'shrine',
      'elephant', 'leopard', 'tea plantation', 'tropical',
      'colonial', 'fort', 'beach', 'rainforest', 'waterfall',
      'hindu', 'kovil', 'wildlife', 'safari', 'mountain'
    ];

    const labelDescriptions = labels
      .map(label => (label.description || '').toLowerCase())
      .join(' ');

    return sriLankaKeywords.some(keyword => labelDescriptions.includes(keyword));
  }
}