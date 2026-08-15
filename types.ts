

export type LipStatus = 'Natural' | 'Filled';

export type InjectionTechnique = 'Linear Threading' | 'Bolus' | 'Fanning' | 'Retrograde' | 'Micro-droplets';
export type TissueLayer = 'Subcutaneous' | 'Submucosal' | 'Vermilion Border' | 'Intramuscular (Avoid)';
export type ProductGrade = 'High G-Prime (Structural)' | 'Medium Cohesivity (Dynamic)' | 'Low Viscosity (Hydration)';

export interface InjectionPoint {
  id: string;
  x: number; 
  y: number; 
  mdCode: string; 
  label: string;
  description: string;
  intensity: number; // 0-1
  volume_ml: number; 
  needle_gauge: string;
  technique: InjectionTechnique;
  plane: TissueLayer;
  suggested_material: string;
  angle_deg: number;
}

export interface ClinicalManifest {
  total_volume_estimate: number;
  primary_filler_brand: string;
  secondary_filler_brand?: string;
  estimated_duration_months: number;
  practitioner_notes: string;
  safety_warnings: string[];
  needle_kit_req: string[];
}

export interface ProcedureBlueprint {
  injectionPoints: InjectionPoint[];
  manifest: ClinicalManifest;
  primaryGoal: string;
  volumeDeltaScore: number;
  sideProfileAnalysis: {
    projectionStatus: string;
    eLineMatch: number;
  };
  simulation?: SimulationResult;
  generatedAt: string;
  safetyCheckPassed: boolean;
}

export interface SimulationResult {
  potentialScore: number;
  projectedArchetype: LipArchetype;
  structuralIntegrityScore: number; 
  ogeeCurveMatch: number;
  auditRecommendation?: 'Proceed' | 'Maintain';
}

export interface LipFeatures {
  upper_lip_height: number;
  lower_lip_height: number;
  mouth_width: number;
  face_width: number;
  lip_area: number;
  lower_face_area: number;
  left_lip_area: number;
  right_lip_area: number;
  lower_lip_central_height: number;
  lateral_upper_height: number;
  cupid_bow_depth: number;
  cupid_bow_symmetry: number;
  corner_taper_ratio: number;
  philtrum_definition_index: number;
  vermilion_contrast_index: number;
  corner_uplift_angle_deg: number;
  border_sharpness_index: number;
  dryness_index: number;
  wrinkle_roughness: number;
  vertical_crease_density: number;
  glossiness_index: number;
  lumpy_texture_index: number;
  filler_migration_index: number;
  redness: number;
  color_uniformity: number;
  discoloration_index: number;
  pigmentation_saturation: number;
  gradient_smoothness_index: number;
  lip_to_lower_face_area_ratio: number;
  lip_projection_index: number;
  duck_lip_index: number;
  yaw_deviation_deg: number;
  pitch_deviation_deg: number;
  roll_deviation_deg: number;
  occlusion_fraction: number;
  blur_index: number;
}

export interface DiagnosticIndices {
  projection: number;
  migration: number;
  textureIntegrity: number;
  definition: number;
  volumetricBalance: number;
}

export interface DetailedScores {
  cupidBowPrecision: number;
  cornerDefinition: number;
  philtrumDepth: number;
  vermilionContrast: number;
  lateralVolume: number;
  lowerLipPout: number;
  smoothness: number;
  hydration: number;
  borderDefinition: number;
  verticalLineScore: number;
  naturalGloss: number;
  skinHealth: number;
  vitality: number;
  uniformity: number;
  pigmentationDepth: number;
  gradient smoothness_index: number;
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
  | 'The Rosebud'
  | 'Botched Job' 
  | 'The Trout';

export interface ScoringResult {
  totalScore: number;
  rankScore: number;
  lipArchetype: LipArchetype; 
  goldenRatioMatch: number;
  cosmeticIntegrity: number;
  diagnostics: DiagnosticIndices;
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
  email: string;
  fingerprint: string;
  nickname: string;
  location_city: string;
  location_country: string;
  country_code?: string;
  lip_image_url: string;
  face_image_url: string;
  side_lip_image_url?: string;
  side_face_image_url?: string;
  status: LipStatus;
  muse_image_url?: string;
  muse_lip_url?: string;
  muse_scoring_result?: ScoringResult;
  muse_match_score?: number;
  muse_blueprint?: ProcedureBlueprint;
  allow_full_face_public: boolean;
  score: number;
  rank: number;
  features?: LipFeatures;
  scoringResult?: ScoringResult;
  isCurrentUser?: boolean;
}

/** Fix: Added missing ArchitectProfile interface used by Leaderboard and mockData */
export interface ArchitectProfile {
  id: string;
  name: string;
  clinic: string;
  specialty: string;
  location: string;
  engineeringScore: number;
  totalProcedures: number;
  verified: boolean;
  portfolio: string[];
}

export type AppView = 'onboarding' | 'uploadFront' | 'cropFront' | 'uploadSide' | 'cropSide' | 'analyzing' | 'result' | 'profile' | 'leaderboard' | 'uploadMuse' | 'cropMuse';