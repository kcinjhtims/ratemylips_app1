
import { LipFeatures, LipStatus } from '../types';

export interface SyntheticPersona {
  name: string;
  description: string;
  status: LipStatus;
  features: LipFeatures;
  expectedArchetype: string;
}

const baseFeatures: LipFeatures = {
  upper_lip_height: 0.8,
  lower_lip_height: 1.2,
  mouth_width: 5.0,
  face_width: 12.0,
  lip_area: 5.0,
  lower_face_area: 20.0,
  left_lip_area: 2.5,
  right_lip_area: 2.5,
  lower_lip_central_height: 1.0,
  lateral_upper_height: 0.5,
  cupid_bow_depth: 0.8,
  cupid_bow_symmetry: 1.0,
  corner_taper_ratio: 0.6,
  philtrum_definition_index: 0.5,
  vermilion_contrast_index: 0.5,
  corner_uplift_angle_deg: 5,
  border_sharpness_index: 0.6,
  dryness_index: 0.2,
  wrinkle_roughness: 0.2,
  vertical_crease_density: 0.2,
  glossiness_index: 0.5,
  lumpy_texture_index: 0.1,
  filler_migration_index: 0.0,
  redness: 0.6,
  color_uniformity: 0.9,
  discoloration_index: 0.1,
  pigmentation_saturation: 0.7,
  gradient_smoothness_index: 0.9,
  lip_to_lower_face_area_ratio: 0.2,
  lip_projection_index: 0.2,
  duck_lip_index: 0.1,
  yaw_deviation_deg: 0,
  pitch_deviation_deg: 0,
  roll_deviation_deg: 0,
  occlusion_fraction: 0,
  blur_index: 0.1
};

export const SYNTHETIC_PERSONAS: SyntheticPersona[] = [
  {
    name: "The Icon (Control)",
    description: "Perfect Golden Ratio, high symmetry, healthy tissue.",
    status: 'Natural',
    expectedArchetype: 'The Classic',
    features: {
      ...baseFeatures,
      upper_lip_height: 0.74, // 0.74/1.2 = ~0.618
      lower_lip_height: 1.2,
      left_lip_area: 2.5,
      right_lip_area: 2.5,
      redness: 0.8,
      dryness_index: 0.05,
      lumpy_texture_index: 0.0
    }
  },
  {
    name: "The Trout (Overfilled)",
    description: "High projection, migrated border, loss of cupid bow definition.",
    status: 'Filled',
    expectedArchetype: 'The Trout',
    features: {
      ...baseFeatures,
      upper_lip_height: 1.5,
      lower_lip_height: 1.2,
      duck_lip_index: 0.85,
      filler_migration_index: 0.7,
      cupid_bow_depth: 0.2,
      lumpy_texture_index: 0.4
    }
  },
  {
    name: "The Botched (Migration/Lumps)",
    description: "Irregular texture, visible lumps, shelf formation.",
    status: 'Filled',
    expectedArchetype: 'Botched Job',
    features: {
      ...baseFeatures,
      lumpy_texture_index: 0.9,
      filler_migration_index: 0.6,
      color_uniformity: 0.3,
      border_sharpness_index: 0.1
    }
  },
  {
    name: "The Sahara (Severe Dehydration)",
    description: "Good shape but extreme surface roughness and creases.",
    status: 'Natural',
    expectedArchetype: 'The Classic',
    features: {
      ...baseFeatures,
      dryness_index: 0.95,
      wrinkle_roughness: 0.9,
      vertical_crease_density: 0.8,
      redness: 0.3
    }
  }
];
