
import { LipFeatures, ScoringResult, LipArchetype } from '../types';

// --- Helper Math Functions ---
const max = (...args: number[]) => Math.max(...args);
const min = (...args: number[]) => Math.min(...args);
const abs = Math.abs;
const exp = Math.exp;

// Helper for normalization 0-100
const norm = (val: number) => max(0, min(100, val));

// --- Archetype Logic ---
function determineArchetype(f: LipFeatures): LipArchetype {
    const ratio = f.upper_lip_height / f.lower_lip_height; // Ideal ~0.618
    const bowDepth = f.cupid_bow_depth; // High = sharp
    const width = f.mouth_width;
    const fullness = f.lip_area;

    if (bowDepth > 1.3 && ratio > 0.6) return 'The Cupid'; // Very sharp bow, fairly full
    if (ratio > 0.8) return 'The Pillowy'; // Top lip almost as big as bottom, full
    if (width > 5.5) return 'The Wide Smile'; // Physically wide mouth
    if (width < 4.0 && fullness > 5.0) return 'The Rosebud'; // Small width, high volume
    if (bowDepth > 1.0 && f.border_sharpness_index > 0.8) return 'The Hollywood'; // Defined, sharp
    if (f.dryness_index < 0.3 && f.vertical_crease_density < 0.3) return 'The Natural'; // Smooth, average
    return 'The Classic'; // Balanced
}

// --- Lip Age Calculation ---
// Based on PDF: Aging = thinner lips, flatter philtrum, blurred border, dryness
function calculateLipAge(f: LipFeatures): number {
    const baseAge = 25;
    
    // Penalty for thinness (volume loss)
    let age = baseAge;
    if (f.lip_area < 4.0) age += 5;
    if (f.lip_area < 3.0) age += 5;

    // Penalty for Philtrum flattening
    if (f.philtrum_definition_index < 0.4) age += 4;

    // Penalty for Border blurriness (Vermilion fading)
    if (f.border_sharpness_index < 0.5) age += 5;
    if (f.border_sharpness_index < 0.3) age += 5;

    // Penalty for Vertical Creases (Barcode lines)
    if (f.vertical_crease_density > 0.5) age += 6;
    if (f.vertical_crease_density > 0.7) age += 5;

    // Penalty for corners turning down
    if (f.corner_uplift_angle_deg < -5) age += 4;

    // Cap reasonable range
    return Math.floor(max(18, min(65, age)));
}

// --- Scoring Functions ---

function symmetry_score(f: LipFeatures): number {
    const asym = abs(f.left_lip_area - f.right_lip_area) / max(f.left_lip_area, f.right_lip_area, 1e-6);
    if (asym <= 0.05) return 100.0;
    if (asym >= 0.30) return 20.0;
    return 100.0 - (asym - 0.05) * (80.0 / 0.25);
}

function horizontal_proportion_score(f: LipFeatures): number {
    // PDF says mouth width should be ~40% of lower face width
    const ratio = f.mouth_width / max(f.face_width, 1e-6);
    const ideal = 0.40; 
    const sigma = 0.08;
    const deviation = (ratio - ideal) / sigma;
    const score = 100.0 * exp(-0.5 * deviation * deviation);
    return max(0.0, min(100.0, score));
}

function vertical_proportion_score(f: LipFeatures): number {
    const ratio = f.upper_lip_height / max(f.lower_lip_height, 1e-6);
    // PDF: Golden Ratio 1:1.618 means Upper is 1, Lower is 1.618. 
    // So Upper/Lower = 1/1.618 = 0.618
    const ideal = 0.618; 
    // PDF also allows 1:2 (0.5) and 1:1 (1.0) as trends, but 1:1.6 is the scientific ideal.
    
    const deviation = abs(ratio - ideal);
    // Stricter bell curve
    let score = 100.0 * exp(-10.0 * deviation * deviation);
    
    // Bonus for current trends (slightly fuller upper lip allowed up to 1:1)
    if (ratio > 0.618 && ratio < 0.9) {
        score += 10; // Trend adjustment
    }

    return max(0.0, min(100.0, score));
}

function shape_definition_score(f: LipFeatures): number {
    const depth_score = 100.0 * min(1.0, f.cupid_bow_depth / 1.2);
    const sym_score = 100.0 * f.cupid_bow_symmetry;
    
    const ideal_taper = 0.6;
    const taper_deviation = abs(f.corner_taper_ratio - ideal_taper);
    const taper_score = max(0.0, 100.0 - (taper_deviation / 0.3) * 80.0);
    
    const philtrum_score = f.philtrum_definition_index * 100;
    const contrast_score = f.vermilion_contrast_index * 100;

    return (0.25 * depth_score) + (0.2 * sym_score) + (0.2 * taper_score) + (0.15 * philtrum_score) + (0.2 * contrast_score);
}

function texture_border_score(f: LipFeatures): number {
    const border = 100.0 * f.border_sharpness_index;
    const dryness_penalty = 120.0 * f.dryness_index; 
    const wrinkle_penalty = 80.0 * f.wrinkle_roughness;
    
    // PDF: Vertical lines can bleed color (aging).
    const crease_ideal = 0.2; // Low amount is natural
    const crease_dev = abs(f.vertical_crease_density - crease_ideal);
    const crease_score = 100 * exp(-4.0 * crease_dev * crease_dev);

    const gloss_score = f.glossiness_index * 100;

    let base = (border * 0.3) + (crease_score * 0.2) + (gloss_score * 0.2) + (100 - dryness_penalty * 0.5) * 0.3;
    base -= wrinkle_penalty * 0.5;

    return max(0.0, min(100.0, base));
}

function color_score(f: LipFeatures): number {
    const redness = f.redness;
    let redness_component = 0;
    if (redness < 0.1 || redness > 0.9) {
        redness_component = 20.0;
    } else {
        redness_component = 100.0 * (1 - abs(redness - 0.5) / 0.5);
    }
    
    const uniformity_component = 100.0 * f.color_uniformity;
    const saturation_score = f.pigmentation_saturation * 100;
    const discoloration_penalty = 150.0 * f.discoloration_index;
    
    const score = (0.3 * redness_component) + (0.4 * uniformity_component) + (0.3 * saturation_score) - discoloration_penalty;
    return max(0.0, min(100.0, score));
}

function naturalness_score(f: LipFeatures): number {
    const ratio = f.lip_to_lower_face_area_ratio;
    const ideal = 0.22;
    const sigma = 0.06;
    const deviation = (ratio - ideal) / sigma;
    const area_component = 100.0 * exp(-0.5 * deviation * deviation);
    
    // PDF Warning: "Duck lips" or over-protrusion
    const projection_penalty = 180.0 * f.lip_projection_index;
    const duck_penalty = 250.0 * f.duck_lip_index;
    
    const base = area_component - projection_penalty - duck_penalty;
    return max(0.0, min(100.0, base));
}

function pose_quality_score(f: LipFeatures): number {
    const ang = abs(f.yaw_deviation_deg) + abs(f.pitch_deviation_deg) + abs(f.roll_deviation_deg);
    const pose_penalty = min(60.0, ang * 3.0);
    const occl_penalty = 150.0 * f.occlusion_fraction;
    const blur_penalty = 120.0 * f.blur_index;
    const base = 100.0 - pose_penalty - occl_penalty - blur_penalty;
    return max(0.0, min(100.0, base));
}

function combine_to_0_100(f: LipFeatures): number {
    const s_sym = symmetry_score(f);
    const s_horiz = horizontal_proportion_score(f);
    const s_vert = vertical_proportion_score(f);
    const s_shape = shape_definition_score(f);
    const s_tex = texture_border_score(f);
    const s_col = color_score(f);
    const s_nat = naturalness_score(f);
    const s_pose = pose_quality_score(f);
    
    let base = (
        0.15 * s_sym +
        0.10 * s_horiz +
        0.10 * s_vert +
        0.15 * s_shape +
        0.15 * s_tex +
        0.10 * s_col +
        0.20 * s_nat +
        0.05 * s_pose
    );
    
    if (s_tex > 60 && s_shape > 60 && s_nat > 60) {
        const high_count = [s_sym, s_horiz, s_vert, s_shape, s_tex, s_col, s_nat].filter(s => s >= 85).length;
        const bonus = min(8.0, high_count * 1.2);
        base += bonus;
    }
    
    if (f.occlusion_fraction > 0.3) base = min(base, 30.0);
    if (f.blur_index > 0.4) base = min(base, 40.0);
    if (f.dryness_index > 0.7) base = min(base, 50.0);
    if (f.discoloration_index > 0.6) base = min(base, 45.0);
    
    return max(0.0, min(100.0, base));
}

export function calculateLipScore(f: LipFeatures): ScoringResult {
    const finalScore0to100 = combine_to_0_100(f);
    const totalScore = Math.round(finalScore0to100 / 100.0 * 10000);

    // --- Metric Calculations for Detailed View ---
    
    const crease_dev = abs(f.vertical_crease_density - 0.3);
    const verticalLineScore = norm(100 * exp(-4.0 * crease_dev * crease_dev));
    const upliftScore = norm(((f.corner_uplift_angle_deg + 10) / 40) * 100);

    // Golden Ratio Calc
    const currentRatio = f.upper_lip_height / max(f.lower_lip_height, 0.1);
    const goldenRatio = 0.618;
    const ratioDiff = abs(currentRatio - goldenRatio);
    // Score 100 if perfect, drop off quickly
    const goldenRatioMatch = norm(100 * exp(-8.0 * ratioDiff));

    const balanceRatio = f.upper_lip_height / max(f.lower_lip_height, 0.1);
    const balanceDev = abs(balanceRatio - 0.618);
    const upperLowerBalance = norm(100 * exp(-2.0 * balanceDev));

    return {
        totalScore,
        rankScore: finalScore0to100,
        lipArchetype: determineArchetype(f),
        lipAge: calculateLipAge(f),
        goldenRatioMatch: goldenRatioMatch,
        dimensionScores: {
            symmetry: symmetry_score(f),
            proportionHorizontal: horizontal_proportion_score(f),
            proportionVertical: vertical_proportion_score(f),
            shape: shape_definition_score(f),
            texture: texture_border_score(f),
            color: color_score(f),
            naturalness: naturalness_score(f),
            pose: pose_quality_score(f)
        },
        details: {
            // Architecture
            cupidBowPrecision: norm(f.cupid_bow_depth * 100 / 1.2),
            cornerDefinition: norm((1 - abs(f.corner_taper_ratio - 0.6)/0.6) * 100),
            philtrumDepth: norm(f.philtrum_definition_index * 100),
            vermilionContrast: norm(f.vermilion_contrast_index * 100),
            lateralVolume: norm((f.lateral_upper_height / f.upper_lip_height) * 100), 
            lowerLipPout: norm((f.lower_lip_central_height / f.lower_lip_height) * 100), 

            // Surface Ecology
            smoothness: norm((1 - f.wrinkle_roughness) * 100),
            hydration: norm((1 - f.dryness_index) * 100),
            borderDefinition: norm(f.border_sharpness_index * 100),
            verticalLineScore: verticalLineScore,
            naturalGloss: norm(f.glossiness_index * 100),
            skinHealth: norm((1 - (f.dryness_index * 0.5 + f.discoloration_index * 0.5)) * 100),

            // Chromatic Depth
            vitality: norm(f.redness * 100),
            uniformity: norm(f.color_uniformity * 100),
            pigmentationDepth: norm(f.pigmentation_saturation * 100),
            gradientSmoothness: norm(f.gradient_smoothness_index * 100),

            // Harmonic Ratios
            symmetryBalance: symmetry_score(f),
            widthProportion: horizontal_proportion_score(f),
            verticalRatio: vertical_proportion_score(f),
            upperLowerBalance: upperLowerBalance,
            cornerUplift: upliftScore
        }
    };
}

// --- Simulation Helper ---
export function simulateExtraction(): LipFeatures {
    // Quality Seed (0.0 = Bad, 1.0 = Perfect)
    // Increased Variance for "Boring" results
    const seed = Math.random();
    const q = seed > 0.7 ? 0.8 + Math.random() * 0.2 : Math.random() * 0.8; // 30% chance of high quality

    const isAsymmetric = Math.random() < 0.20;
    const isDry = Math.random() < 0.25; 
    const isDuckFace = Math.random() < 0.10;
    const isDiscolored = Math.random() < 0.15;

    // Generate reasonable heights
    const upperH = 0.8 + (Math.random() * 0.6 - 0.3);
    const lowerH = 1.3 + (Math.random() * 0.6 - 0.3);

    return {
        upper_lip_height: upperH,
        lower_lip_height: lowerH,
        mouth_width: 4.5 + (Math.random() * 1.5),
        face_width: 12.0 + (Math.random() * 1.0),
        lip_area: 4.0 + (q * 2.0) + (Math.random() * 1.0),
        lower_face_area: 20.0,
        
        left_lip_area: 2.5 + (isAsymmetric ? (Math.random() - 0.5) : (Math.random() * 0.1 - 0.05)),
        right_lip_area: 2.5,

        // Detailed contour features
        lower_lip_central_height: lowerH * (0.9 + Math.random() * 0.2), 
        lateral_upper_height: upperH * (0.5 + Math.random() * 0.3), 
        
        cupid_bow_depth: q * 1.3 + (Math.random() * 0.3),
        cupid_bow_symmetry: isAsymmetric ? 0.4 + Math.random() * 0.4 : 0.9 + Math.random() * 0.1,
        corner_taper_ratio: 0.6 + (Math.random() * 0.2 - 0.1),
        philtrum_definition_index: q * 0.8 + Math.random() * 0.2,
        vermilion_contrast_index: q * 0.9 + Math.random() * 0.1,
        corner_uplift_angle_deg: (q * 25) - 10 + (Math.random() * 15), 

        border_sharpness_index: q * 0.9 + (Math.random() * 0.1),
        dryness_index: isDry ? (0.5 + Math.random() * 0.5) : (Math.random() * 0.2),
        wrinkle_roughness: isDry ? (0.6 + Math.random() * 0.4) : (Math.random() * 0.2),
        vertical_crease_density: isDry ? 0.6 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2, 
        glossiness_index: isDry ? 0.1 + Math.random() * 0.2 : q * 0.8 + Math.random() * 0.2,

        redness: 0.5 + (Math.random() * 0.4 - 0.2),
        color_uniformity: q * 0.9 + Math.random() * 0.1,
        discoloration_index: isDiscolored ? 0.5 + Math.random() * 0.5 : Math.random() * 0.1,
        pigmentation_saturation: 0.4 + (q * 0.5) + Math.random() * 0.1,
        gradient_smoothness_index: q * 0.8 + Math.random() * 0.2,
        
        lip_to_lower_face_area_ratio: 0.22 + (Math.random() * 0.05 - 0.025),
        lip_projection_index: isDuckFace ? 0.7 + Math.random() * 0.3 : Math.random() * 0.2,
        duck_lip_index: isDuckFace ? 0.8 + Math.random() * 0.2 : 0.0,
        
        yaw_deviation_deg: Math.random() * 10,
        pitch_deviation_deg: Math.random() * 5,
        roll_deviation_deg: Math.random() * 2,
        occlusion_fraction: 0,
        blur_index: Math.random() * 0.1
    };
}
