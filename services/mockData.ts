
import { UserProfile } from '../types';

export const MOCK_LEADERBOARD: UserProfile[] = [
  {
    id: '1',
    nickname: 'Bella_S',
    location_city: 'Milan',
    location_country: 'Italy',
    score: 9850,
    rank: 1,
    lip_image_url: 'https://picsum.photos/id/64/200/100',
    face_image_url: 'https://picsum.photos/id/64/600/600',
    allow_full_face_public: true,
    scoringResult: {
      totalScore: 9850,
      rankScore: 98.5,
      lipArchetype: 'The Classic',
      lipAge: 22,
      goldenRatioMatch: 98,
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
    nickname: 'PoutyKate',
    location_city: 'London',
    location_country: 'UK',
    score: 9720,
    rank: 2,
    lip_image_url: 'https://picsum.photos/id/338/200/100',
    face_image_url: 'https://picsum.photos/id/338/600/600',
    allow_full_face_public: false,
    scoringResult: {
      totalScore: 9720,
      rankScore: 97.2,
      lipArchetype: 'The Hollywood',
      lipAge: 24,
      goldenRatioMatch: 95,
      dimensionScores: {
        symmetry: 95, proportionHorizontal: 92, proportionVertical: 96, shape: 98, texture: 94, color: 96, naturalness: 95, pose: 99
      },
      details: {
        cupidBowPrecision: 98, cornerDefinition: 95, verticalRatio: 94, smoothness: 93, hydration: 95, borderDefinition: 96, vitality: 97, uniformity: 95, symmetryBalance: 95, widthProportion: 92,
        philtrumDepth: 94, vermilionContrast: 95, lateralVolume: 85, lowerLipPout: 92, verticalLineScore: 88, naturalGloss: 90, skinHealth: 94, pigmentationDepth: 96, gradientSmoothness: 92, upperLowerBalance: 95, cornerUplift: 80
      }
    }
  },
  {
    id: '3',
    nickname: 'LipGlow99',
    location_city: 'Seoul',
    location_country: 'South Korea',
    score: 9650,
    rank: 3,
    lip_image_url: 'https://picsum.photos/id/349/200/100',
    face_image_url: 'https://picsum.photos/id/349/600/600',
    allow_full_face_public: true,
    scoringResult: {
        totalScore: 9650,
        rankScore: 96.5,
        lipArchetype: 'The Pillowy',
        lipAge: 20,
        goldenRatioMatch: 90,
        dimensionScores: {
          symmetry: 96, proportionHorizontal: 94, proportionVertical: 95, shape: 94, texture: 98, color: 93, naturalness: 96, pose: 98
        },
        details: {
          cupidBowPrecision: 92, cornerDefinition: 90, verticalRatio: 95, smoothness: 99, hydration: 98, borderDefinition: 94, vitality: 92, uniformity: 96, symmetryBalance: 96, widthProportion: 94,
          philtrumDepth: 85, vermilionContrast: 88, lateralVolume: 90, lowerLipPout: 94, verticalLineScore: 95, naturalGloss: 98, skinHealth: 99, pigmentationDepth: 90, gradientSmoothness: 95, upperLowerBalance: 96, cornerUplift: 90
        }
      }
  },
  {
    id: '4',
    nickname: 'RougeX',
    location_city: 'Paris',
    location_country: 'France',
    score: 9400,
    rank: 4,
    lip_image_url: 'https://picsum.photos/id/436/200/100',
    face_image_url: 'https://picsum.photos/id/436/600/600',
    allow_full_face_public: true,
    scoringResult: {
        totalScore: 9400,
        rankScore: 94.0,
        lipArchetype: 'The Classic',
        lipAge: 28,
        goldenRatioMatch: 88,
        dimensionScores: {
          symmetry: 92, proportionHorizontal: 90, proportionVertical: 93, shape: 95, texture: 90, color: 98, naturalness: 92, pose: 95
        },
        details: {
          cupidBowPrecision: 96, cornerDefinition: 94, verticalRatio: 93, smoothness: 88, hydration: 90, borderDefinition: 92, vitality: 99, uniformity: 97, symmetryBalance: 92, widthProportion: 90,
          philtrumDepth: 92, vermilionContrast: 95, lateralVolume: 80, lowerLipPout: 88, verticalLineScore: 85, naturalGloss: 88, skinHealth: 90, pigmentationDepth: 99, gradientSmoothness: 94, upperLowerBalance: 93, cornerUplift: 75
        }
      }
  },
  {
    id: '5',
    nickname: 'SmileHigh',
    location_city: 'Los Angeles',
    location_country: 'USA',
    score: 9105,
    rank: 5,
    lip_image_url: 'https://picsum.photos/id/129/200/100',
    face_image_url: 'https://picsum.photos/id/129/600/600',
    allow_full_face_public: false,
    scoringResult: {
        totalScore: 9105,
        rankScore: 91.05,
        lipArchetype: 'The Wide Smile',
        lipAge: 25,
        goldenRatioMatch: 85,
        dimensionScores: {
          symmetry: 90, proportionHorizontal: 88, proportionVertical: 90, shape: 85, texture: 92, color: 88, naturalness: 94, pose: 95
        },
        details: {
          cupidBowPrecision: 82, cornerDefinition: 85, verticalRatio: 90, smoothness: 92, hydration: 93, borderDefinition: 88, vitality: 86, uniformity: 90, symmetryBalance: 90, widthProportion: 88,
          philtrumDepth: 80, vermilionContrast: 82, lateralVolume: 84, lowerLipPout: 90, verticalLineScore: 92, naturalGloss: 88, skinHealth: 93, pigmentationDepth: 85, gradientSmoothness: 89, upperLowerBalance: 91, cornerUplift: 95
        }
      }
  }
];
