
export interface LipFeatures {
  upper_lip_height: number;
  lower_lip_height: number;
  mouth_width: number;
  face_width: number;
  lip_area: number;
  lower_face_area: number;
  left_lip_area: number;
  right_lip_area: number;

  cupid_bow_depth: number;
  cupid_bow_symmetry: number;
  corner_taper_ratio: number;

  border_sharpness_index: number;
  dryness_index: number;
  wrinkle_roughness: number;

  redness: number;
  color_uniformity: number;
  discoloration_index: number;

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
  // Shape
  cupidBowPrecision: number;
  cornerDefinition: number;
  verticalRatio: number;
  
  // Texture
  smoothness: number;
  hydration: number;
  borderDefinition: number;
  
  // Color
  vitality: number;
  uniformity: number;
  
  // Geometry
  symmetryBalance: number;
  widthProportion: number;
}

export interface ScoringResult {
  totalScore: number; // 0-10000
  rankScore: number; // 0-100
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
  lip_image_url: string; // The cropped tic-tac image
  face_image_url: string; // The original
  allow_full_face_public: boolean;
  score: number;
  rank: number;
  features?: LipFeatures;
  scoringResult?: ScoringResult;
  isCurrentUser?: boolean;
}

export type AppView = 'onboarding' | 'upload' | 'crop' | 'analyzing' | 'result' | 'profile' | 'leaderboard';
