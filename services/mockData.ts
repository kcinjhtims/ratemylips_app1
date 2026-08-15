
import { UserProfile, ArchitectProfile } from '../types';

export const MOCK_ARCHITECTS: ArchitectProfile[] = [
  {
    id: 'a1',
    name: 'Dr. Julian Thorne',
    clinic: 'The Sculpt Center',
    specialty: 'Lip Reconstruction',
    location: 'Beverly Hills, CA',
    engineeringScore: 98.2,
    totalProcedures: 1250,
    verified: true,
    portfolio: ['https://picsum.photos/id/1/200/200']
  },
  {
    id: 'a2',
    name: 'Nurse Elena R.',
    clinic: 'Pout Perfection',
    specialty: 'Russian Technique',
    location: 'Miami, FL',
    engineeringScore: 96.5,
    totalProcedures: 890,
    verified: true,
    portfolio: ['https://picsum.photos/id/2/200/200']
  },
  {
    id: 'a3',
    name: 'Aesthetic Studio X',
    clinic: 'Studio X',
    specialty: 'Natural Enhancement',
    location: 'London, UK',
    engineeringScore: 94.1,
    totalProcedures: 2100,
    verified: true,
    portfolio: ['https://picsum.photos/id/3/200/200']
  }
];

const BASE_PROFILES: UserProfile[] = [
  {
    id: '1',
    email: 'bella.s@example.com',
    fingerprint: 'mock_fp_1',
    nickname: 'Bella_S',
    location_city: 'Milan',
    location_country: 'Italy',
    country_code: 'IT',
    status: 'Natural',
    score: 9850,
    rank: 1,
    lip_image_url: 'https://picsum.photos/id/64/200/100',
    face_image_url: 'https://picsum.photos/id/64/600/600',
    allow_full_face_public: true,
    scoringResult: {
      totalScore: 9850,
      rankScore: 98.5,
      lipArchetype: 'The Classic',
      cosmeticIntegrity: 98,
      goldenRatioMatch: 98,
      // Fix: Added missing diagnostics property for ScoringResult
      diagnostics: {
        projection: 98,
        migration: 99,
        textureIntegrity: 98,
        definition: 97,
        volumetricBalance: 99
      },
      dimensionScores: {
        symmetry: 99, proportionHorizontal: 95, proportionVertical: 98, shape: 97, texture: 96, color: 95, naturalness: 98, pose: 100
      },
      details: {
        cupidBowPrecision: 95, cornerDefinition: 92, verticalRatio: 96, smoothness: 98, hydration: 97, borderDefinition: 95, vitality: 94, uniformity: 98, symmetryBalance: 99, widthProportion: 95,
        philtrumDepth: 90, vermilionContrast: 92, lateralVolume: 88, lowerLipPout: 95, verticalLineScore: 90, naturalGloss: 94, skinHealth: 98, pigmentationDepth: 93, gradientSmoothness: 96, upperLowerBalance: 99, cornerUplift: 85
      }
    }
  },
  {
    id: '2',
    email: 'poutykate@example.com',
    fingerprint: 'mock_fp_2',
    nickname: 'PoutyKate',
    location_city: 'London',
    location_country: 'UK',
    country_code: 'GB',
    status: 'Filled',
    score: 9720,
    rank: 2,
    lip_image_url: 'https://picsum.photos/id/338/200/100',
    face_image_url: 'https://picsum.photos/id/338/600/600',
    allow_full_face_public: false,
    scoringResult: {
      totalScore: 9720,
      rankScore: 97.2,
      lipArchetype: 'The Hollywood',
      cosmeticIntegrity: 95,
      goldenRatioMatch: 95,
      // Fix: Added missing diagnostics property for ScoringResult
      diagnostics: {
        projection: 94,
        migration: 92,
        textureIntegrity: 95,
        definition: 96,
        volumetricBalance: 95
      },
      dimensionScores: {
        symmetry: 95, proportionHorizontal: 92, proportionVertical: 96, shape: 98, texture: 94, color: 96, naturalness: 95, pose: 99
      },
      details: {
        cupidBowPrecision: 98, cornerDefinition: 95, verticalRatio: 94, smoothness: 93, hydration: 95, borderDefinition: 96, vitality: 97, uniformity: 95, symmetryBalance: 95, widthProportion: 92,
        philtrumDepth: 94, vermilionContrast: 95, lateralVolume: 85, lowerLipPout: 92, verticalLineScore: 88, naturalGloss: 90, skinHealth: 94, pigmentationDepth: 96, gradientSmoothness: 92, upperLowerBalance: 95, cornerUplift: 80
      }
    }
  }
];

export const MOCK_LEADERBOARD = [...BASE_PROFILES];