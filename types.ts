
export interface LipFeatures {
  // Dimensions (mm or ratio units)
  upper_lip_height: number;
  lower_lip_height: number;
  mouth_width: number;
  face_width: number;
  lip_area: number;
  lower_face_area: number;
  left_lip_area: number;
  right_lip_area: number;
  
  // Specific Contour features
  lower_lip_central_height: number;
  lateral_upper_height: number;

  // Shape & Definition
  cupid_bow_depth: number;
  cupid_bow_symmetry: number;
  corner_taper_ratio: number;
  philtrum_definition_index: number;
  vermilion_contrast_index: number;
  corner_uplift_angle_deg: number;

  // Surface & Texture
  border_sharpness_index: number;
  dryness_index: number;
  wrinkle_roughness: number;
  vertical_crease_density: number;
  glossiness_index: number;

  // Color & Tone
  redness: number;
  color_uniformity: number;
  discoloration_index: number;
  pigmentation_saturation: number;
  gradient_smoothness_index: number;

  // Volumetrics & Pose
  lip_to_lower_face_area_ratio: number;
  lip_projection_index: number;
  duck_lip_index: number;

  yaw_deviation_deg: number;
  pitch_deviation_deg: number;
  roll_deviation_deg: number;
  occlusion_fraction: number;
  blur_index: number;
}

export interface DetailedScores {
  // Category 1: Architecture (Shape & Contour)
  cupidBowPrecision: number;
  cornerDefinition: number;
  philtrumDepth: number;
  vermilionContrast: number;
  lateralVolume: number;
  lowerLipPout: number;

  // Category 2: Surface Ecology (Texture & Health)
  smoothness: number;
  hydration: number;
  borderDefinition: number;
  verticalLineScore: number;
  naturalGloss: number;
  skinHealth: number;

  // Category 3: Chromatic Depth (Color)
  vitality: number;
  uniformity: number;
  pigmentationDepth: number;
  gradientSmoothness: number;

  // Category 4: Harmonic Ratios (Proportions)
  symmetryBalance: number;
  widthProportion: number;
  verticalRatio: number;
  upperLowerBalance: number;
  cornerUplift: number;
}

export type LipArchetype = 
  | 'The Classic' 
  | 'The Hollywood' 
  | 'The Pillowy' 
  | 'The Cupid' 
  | 'The Natural' 
  | 'The Wide Smile' 
  | 'The Rosebud';

export interface ScoringResult {
  totalScore: number; // 0-10000
  rankScore: number; // 0-100
  lipArchetype: LipArchetype; // New
  lipAge: number; // New (Simulated biological age of lips)
  goldenRatioMatch: number; // 0-100 How close to 1:1.618
  dimensionScores: {
    symmetry: number;
    proportionHorizontal: number;
    proportionVertical: number;
    shape: number;
    texture: number;
    color: number;
    naturalness: number;
    pose: number;
  };
  details: DetailedScores;
}

export interface UserProfile {
  id: string;
  nickname: string;
  location_city: string;
  location_country: string;
  lip_image_url: string;
  face_image_url: string;
  allow_full_face_public: boolean;
  score: number;
  rank: number;
  features?: LipFeatures;
  scoringResult?: ScoringResult;
  isCurrentUser?: boolean;
}

export type AppView = 'onboarding' | 'upload' | 'crop' | 'analyzing' | 'result' | 'profile' | 'leaderboard';
