
import { LipFeatures, ScoringResult } from '../types';

// --- Helper Math Functions ---
const max = (...args: number[]) => Math.max(...args);
const min = (...args: number[]) => Math.min(...args);
const abs = Math.abs;
const exp = Math.exp;

// --- Scoring Functions ---

function symmetry_score(f: LipFeatures): number {
    const asym = abs(f.left_lip_area - f.right_lip_area) / max(f.left_lip_area, f.right_lip_area, 1e-6);
    if (asym <= 0.05) return 100.0;
    if (asym >= 0.30) return 20.0;
    return 100.0 - (asym - 0.05) * (80.0 / 0.25);
}

function horizontal_proportion_score(f: LipFeatures): number {
    const ratio = f.mouth_width / max(f.face_width, 1e-6);
    const ideal = 0.5; // More realistic ideal mouth width ratio relative to face
    const sigma = 0.1;
    const deviation = (ratio - ideal) / sigma;
    const score = 100.0 * exp(-0.5 * deviation * deviation);
    return max(0.0, min(100.0, score));
}

function vertical_proportion_score(f: LipFeatures): number {
    const ratio = f.upper_lip_height / max(f.lower_lip_height, 1e-6);
    // Ideal golden ratio for lips is often cited as 1:1.618 (upper:lower), so approx 0.61
    const ideal = 1.0 / 1.618; 
    const sigma = 0.15;
    const deviation = (ratio - ideal) / sigma;
    const score = 100.0 * exp(-0.5 * deviation * deviation);
    return max(0.0, min(100.0, score));
}

function shape_definition_score(f: LipFeatures): number {
    // Stricter cupid bow evaluation
    const depth_score = 100.0 * min(1.0, f.cupid_bow_depth / 1.2);
    const sym_score = 100.0 * f.cupid_bow_symmetry;
    
    const ideal_taper = 0.6;
    const taper = f.corner_taper_ratio;
    const taper_deviation = abs(taper - ideal_taper);
    const taper_score = max(0.0, 100.0 - (taper_deviation / 0.3) * 80.0); // Higher penalty for bad taper
    
    return 0.4 * depth_score + 0.3 * sym_score + 0.3 * taper_score;
}

function texture_border_score(f: LipFeatures): number {
    const border = 100.0 * f.border_sharpness_index;
    // Significantly increase penalties for dryness and wrinkles to punish "ugly" lips
    const dryness_penalty = 120.0 * f.dryness_index; 
    const wrinkle_penalty = 100.0 * f.wrinkle_roughness;
    
    let base = border - dryness_penalty - wrinkle_penalty;
    return max(0.0, min(100.0, base));
}

function color_score(f: LipFeatures): number {
    const redness = f.redness;
    let redness_component = 0;
    // Ideal redness range 0.3 - 0.7
    if (redness < 0.1 || redness > 0.9) {
        redness_component = 20.0;
    } else {
        redness_component = 100.0 * (1 - abs(redness - 0.5) / 0.5);
    }
    
    const uniformity_component = 100.0 * f.color_uniformity;
    const discoloration_penalty = 150.0 * f.discoloration_index; // High penalty for discoloration
    
    const score = 0.4 * redness_component + 0.6 * uniformity_component - discoloration_penalty;
    return max(0.0, min(100.0, score));
}

function naturalness_score(f: LipFeatures): number {
    const ratio = f.lip_to_lower_face_area_ratio;
    const ideal = 0.22;
    const sigma = 0.06;
    const deviation = (ratio - ideal) / sigma;
    const area_component = 100.0 * exp(-0.5 * deviation * deviation);
    
    const projection_penalty = 150.0 * f.lip_projection_index; // Punish excessive projection
    const duck_penalty = 200.0 * f.duck_lip_index; // Heavily punish duck face
    
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
    
    // Bonus only if no major flaws
    if (s_tex > 60 && s_shape > 60 && s_nat > 60) {
        const high_count = [s_sym, s_horiz, s_vert, s_shape, s_tex, s_col, s_nat].filter(s => s >= 85).length;
        const bonus = min(8.0, high_count * 1.2);
        base += bonus;
    }
    
    // Hard clamps for bad features
    if (f.occlusion_fraction > 0.3) base = min(base, 30.0);
    if (f.blur_index > 0.4) base = min(base, 40.0);
    if (f.dryness_index > 0.7) base = min(base, 50.0);
    if (f.discoloration_index > 0.6) base = min(base, 45.0);
    
    return max(0.0, min(100.0, base));
}

export function calculateLipScore(f: LipFeatures): ScoringResult {
    const finalScore0to100 = combine_to_0_100(f);
    const totalScore = Math.round(finalScore0to100 / 100.0 * 10000);

    // Helper for details
    const norm = (val: number) => max(0, min(100, val));

    return {
        totalScore,
        rankScore: finalScore0to100,
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
            // Shape
            cupidBowPrecision: norm(f.cupid_bow_depth * 100 / 1.2),
            cornerDefinition: norm((1 - abs(f.corner_taper_ratio - 0.6)/0.6) * 100),
            verticalRatio: vertical_proportion_score(f),
            
            // Texture
            smoothness: norm((1 - f.wrinkle_roughness) * 100),
            hydration: norm((1 - f.dryness_index) * 100),
            borderDefinition: norm(f.border_sharpness_index * 100),
            
            // Color
            vitality: norm(f.redness * 100), // Simplification
            uniformity: norm(f.color_uniformity * 100),
            
            // Geometry
            symmetryBalance: symmetry_score(f),
            widthProportion: horizontal_proportion_score(f)
        }
    };
}

// --- Simulation Helper ---
export function simulateExtraction(): LipFeatures {
    // Generate a "quality factor" to correlate features (0.0 = ugly/bad, 1.0 = perfection)
    const quality = Math.pow(Math.random(), 0.8); // Biased slightly

    // Determine specific flaws
    const isAsymmetric = Math.random() < 0.25;
    const isDry = Math.random() < 0.25; 
    const isDuckFace = Math.random() < 0.10;
    const isDiscolored = Math.random() < 0.15;

    return {
        upper_lip_height: 0.8 + (Math.random() * 0.6 - 0.3),
        lower_lip_height: 1.3 + (Math.random() * 0.6 - 0.3),
        mouth_width: 4.5 + (Math.random() * 1.5),
        face_width: 12.0 + (Math.random() * 1.0),
        lip_area: 5.0,
        lower_face_area: 20.0,
        
        left_lip_area: 2.5 + (isAsymmetric ? (Math.random() * 1.0 - 0.5) : (Math.random() * 0.1 - 0.05)),
        right_lip_area: 2.5,
        
        cupid_bow_depth: quality * 1.2 + (Math.random() * 0.3),
        cupid_bow_symmetry: isAsymmetric ? 0.4 + Math.random() * 0.4 : 0.9 + Math.random() * 0.1,
        corner_taper_ratio: 0.6 + (Math.random() * 0.2 - 0.1),
        
        border_sharpness_index: quality * 0.9 + (Math.random() * 0.1),
        dryness_index: isDry ? (0.4 + Math.random() * 0.6) : (Math.random() * 0.15),
        wrinkle_roughness: isDry ? (0.5 + Math.random() * 0.5) : (Math.random() * 0.2),
        
        redness: 0.5 + (Math.random() * 0.4 - 0.2),
        color_uniformity: quality * 0.9 + Math.random() * 0.1,
        discoloration_index: isDiscolored ? 0.4 + Math.random() * 0.6 : Math.random() * 0.1,
        
        lip_to_lower_face_area_ratio: 0.22 + (Math.random() * 0.05 - 0.025),
        lip_projection_index: isDuckFace ? 0.6 + Math.random() * 0.4 : Math.random() * 0.1,
        duck_lip_index: isDuckFace ? 0.7 + Math.random() * 0.3 : 0.0,
        
        yaw_deviation_deg: Math.random() * 10,
        pitch_deviation_deg: Math.random() * 5,
        roll_deviation_deg: Math.random() * 2,
        occlusion_fraction: 0,
        blur_index: Math.random() * 0.1
    };
}
